import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, Renderer2} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map, take, tap} from 'rxjs/operators';
import {environment} from '@env/environment';

import {LoaderService} from './services/loader.service';
import {UpdateService} from './services/update.service';
import {AudioService} from './services/audio.service';
import {ElectronService} from './services/electron.service';

import {ChangeTheme, CloseSidenav, SetAudioVolume, ToggleSidenav} from './core.actions';
import {CoreUtils, Theme} from './core.utils';

import * as fromRoot from '../app.reducers';

// TODO dependency on settings, refactor
import {SetLyricsOptions} from '@app/settings/settings.actions';
import {getLyricsOptions} from '@app/settings/settings.reducers';

@Component({
  selector: 'app-root',
  template: `
    <div ngClass="mat-typography main-wrapper"
         [class]="currentThemeCssClass$ | async"
         [class.focused]="isElectronFocused"
         [class.electron]="isElectron">

      <app-initializer [initializing]="initializing$ | async"
                       [initializingLog]="logs$ | async"
                       [hasErrors]="hasErrors$ | async"
                       (retry)="initialize()">
      </app-initializer>

      <app-toolbar [sideNavOpened]="showSidenav$ | async"
                   [themes]="featuredThemes"
                   [currentTheme]="currentTheme$ | async"
                   [isElectron]="isElectron"
                   [isMaximized]="isMaximized"
                   [showInstallPrompt]="installPromptEvent !== null"
                   (closeWindow)="closeWindow()"
                   (maximizeWindow)="maximizeWindow()"
                   (minimizeWindow)="minimizeWindow()"
                   (unmaximizeWindow)="unmaximizeWindow()"
                   (changeTheme)="changeTheme($event)"
                   (toggleSidenav)="toggleSidenav()"
                   (install)="install()">
      </app-toolbar>

      <mat-progress-bar class="main-loader"
                        mode="indeterminate"
                        [class.show]="isLoading() | async">
      </mat-progress-bar>

      <app-side-menu [sideNavOpened]="showSidenav$ | async"
                     (closeSidenav)="closeSidenav()"
                     (toggleSidenav)="toggleSidenav()">
      </app-side-menu>

      <mat-sidenav-container (backdropClick)="closeSidenav()">

        <mat-sidenav [opened]="showSidenav$ | async" [mode]="'over'">
          <app-side-nav (closeSidenav)="closeSidenav()"></app-side-nav>
        </mat-sidenav>

        <router-outlet></router-outlet>

      </mat-sidenav-container>

    </div>
  `,
  styles: [`
    .main-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100vh; /* 100vh TODO figure out the issue with player menu */
      min-height: 450px;
      box-sizing: border-box;
    }
    .main-loader {
      position: absolute;
      z-index: 3;
      height: 3px;
      top: 50px;
      display: none;
    }
    .main-loader.show {
      display: inline-block;
    }
    .electron .main-loader {
      top: 34px;
    }
    mat-sidenav-container {
      height: 100%;
    }
    mat-sidenav {
      width: 250px;
    }
    @media screen and (min-width: 599px){
      mat-sidenav-container {
        padding-left: 44px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreComponent implements OnInit {

  showSidenav$: Observable<boolean>;
  currentTheme$: Observable<Theme>;
  currentThemeCssClass$: Observable<string>;

  isElectron = environment.electron;
  isElectronFocused: boolean;
  isMaximized = false;

  featuredThemes: Theme[] = CoreUtils.featuredThemes;

  initializing$: Observable<boolean>;
  logs$: Observable<string>;
  hasErrors$: Observable<boolean>;

  installPromptEvent: any = null;

  constructor(
    private ref: ChangeDetectorRef,
    private store: Store<fromRoot.State>,
    private loader: LoaderService,
    private audioService: AudioService,
    private renderer: Renderer2,
    private appRoot: ElementRef,
    private updateService: UpdateService,
    private electronService: ElectronService
  ) {
    this.initializing$ = this.loader.initializing$;
    this.hasErrors$ = this.loader.hasErrors$;
    this.logs$ = this.loader.log$;

    this.loader.initialize();
    this.updateService.initialize();
  }

  ngOnInit(): void {
    // Set up electron listeners
    this.electronService.onIpc('suspend', this.audioService.pause);
    this.electronService.onWindow('focus', () => {
      this.isElectronFocused = true;
      this.ref.detectChanges();
    });
    this.electronService.onWindow('blur', () => {
      this.isElectronFocused = false;
      this.ref.detectChanges();
    });
    this.electronService.onWindow('maximize', () => {
      this.isMaximized = true;
      this.ref.detectChanges();
    });
    this.electronService.onWindow('unmaximize', () => {
      this.isMaximized = false;
      this.ref.detectChanges();
    });

    // Set up core observables
    this.showSidenav$ = this.store.pipe(select(fromRoot.getShowSidenav));
    this.currentTheme$ = this.store.pipe(select(fromRoot.getCurrentTheme));
    this.currentThemeCssClass$ = this.currentTheme$.pipe(map(t => t.cssClass));

    // Configure Audio Service
    this.audioService.renderer = this.renderer;
    this.audioService.appRoot = this.appRoot;

    // Load and save volume
    CoreUtils.restoreAndSave(
      'volume',
      v => this.store.dispatch(new SetAudioVolume(v)),
      this.store.select(fromRoot.getAudioVolume)
    );

    // Load and save theme
    CoreUtils.restoreAndSave(
      'theme',
      t => this.store.dispatch(new ChangeTheme(t)),
      this.store.select(fromRoot.getCurrentTheme),
      () => this.store.dispatch(new ChangeTheme(CoreUtils.featuredThemes[0]))
    );

    CoreUtils.restoreAndSave(
      'lyricsOptions',
      t => this.store.dispatch(new SetLyricsOptions(t)),
      this.store.select(getLyricsOptions)
    );

  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  beforeInstallPrompt(event: Event) {
    this.installPromptEvent = event;
    event.preventDefault();
  }

  install() {
    if (this.installPromptEvent) {
      this.installPromptEvent.prompt();
      this.installPromptEvent.userChoice
        .then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          this.installPromptEvent = null;
        });
    }
  }

  initialize() {
    this.loader.initialize();
  }

  @HostListener('window:storage', ['$event'])
  onStorage(event) {
    if (event.key === 'theme') {
      this.changeTheme(JSON.parse(event.newValue));
    }
  }

  isLoading(): Observable<boolean> {
    return this.loader.isLoading();
  }

  closeSidenav(): void {
    this.store.select(fromRoot.getShowSidenav).pipe(
      take(1),
      tap(showSidenav => showSidenav ? this.store.dispatch(new CloseSidenav()) : {})
    ).subscribe();
  }

  toggleSidenav(): void {
    this.store.dispatch(new ToggleSidenav());
  }

  changeTheme(theme: Theme): void {
    this.store.dispatch(new ChangeTheme(theme));
  }

  closeWindow(): void {
    this.electronService.getWindow().close();
  }

  minimizeWindow(): void {
    this.electronService.getWindow().minimize();
  }

  maximizeWindow(): void {
    this.electronService.getWindow().maximize();
  }

  unmaximizeWindow(): void {
    this.electronService.getWindow().unmaximize();
  }

}
