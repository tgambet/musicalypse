import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, Renderer2} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {environment} from '@env/environment';

import {LoaderService} from './services/loader.service';
import {AudioService} from './services/audio.service';

import * as fromRoot from '../app.reducers';
import * as LayoutActions from './core.actions';
import {CoreUtils, Theme} from './core.utils';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ChangeTheme} from '@app/core/core.actions';

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
                   (closeWindow)="closeWindow()"
                   (maximizeWindow)="maximizeWindow()"
                   (minimizeWindow)="minimizeWindow()"
                   (unmaximizeWindow)="unmaximizeWindow()"
                   (changeTheme)="changeTheme($event)"
                   (toggleSidenav)="toggleSidenav()">
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
          <app-side-nav [playing]="playing$ | async" (closeSidenav)="closeSidenav()"></app-side-nav>
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
  playing$: Observable<boolean>;

  isElectron = environment.electron;
  isElectronFocused: boolean;
  isMaximized = false;
  electronRemote = environment.electron ? (<any>window).require('electron').remote : null;

  featuredThemes: Theme[] = CoreUtils.featuredThemes;

  initializing$: Observable<boolean>;
  logs$: Observable<string>;
  hasErrors$: Observable<boolean>;

  constructor(
    private ref: ChangeDetectorRef,
    private store: Store<fromRoot.State>,
    private loader: LoaderService,
    private audioService: AudioService,
    private renderer: Renderer2,
    private appRoot: ElementRef
  ) {
    this.initializing$ = this.loader.initializing$;
    this.hasErrors$ = this.loader.hasErrors$;
    this.logs$ = this.loader.log$;

    this.loader.initialize();
  }

  ngOnInit(): void {

    // Set up electron listeners
    if (environment.electron) {
      const ipc = environment.electron ? (<any>window).require('electron').ipcRenderer : null;
      ipc.on('focus', () => {
        this.isElectronFocused = true;
        this.ref.detectChanges(); // TODO investigate why ngZone.run doesn't work here
      });
      ipc.on('blur', () => {
        this.isElectronFocused = false;
        this.ref.detectChanges();
      });
      this.electronRemote.getCurrentWindow().addListener('maximize', () => {
        this.isMaximized = true;
        this.ref.detectChanges();
      });
      this.electronRemote.getCurrentWindow().addListener('unmaximize', () => {
        this.isMaximized = false;
        this.ref.detectChanges();
      });
    }

    // Set up core observables
    this.showSidenav$ = this.store.pipe(select(fromRoot.getShowSidenav));
    this.currentTheme$ = this.store.pipe(select(fromRoot.getCurrentTheme));
    this.currentThemeCssClass$ = this.currentTheme$.pipe(map(t => t.cssClass));
    this.playing$ = this.audioService.playing$;

    // Configure Audio Service
    this.audioService.renderer = this.renderer;
    this.audioService.appRoot = this.appRoot;

    // Load the last theme
    const savedTheme = CoreUtils.load('theme');
    if (savedTheme) {
      this.changeTheme(JSON.parse(savedTheme));
    } else {
      this.store.dispatch(new ChangeTheme(CoreUtils.featuredThemes[0]));
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

  // openSidenav() {
  //   this.store.dispatch(new LayoutActions.OpenSidenav());
  // }

  closeSidenav(): void {
    this.store.dispatch(new LayoutActions.CloseSidenav());
  }

  toggleSidenav(): void {
    this.store.dispatch(new LayoutActions.ToggleSidenav());
  }

  changeTheme(theme: Theme): void {
    this.store.dispatch(new LayoutActions.ChangeTheme(theme));
  }

  closeWindow(): void {
    this.electronRemote.getCurrentWindow().close();
  }

  minimizeWindow(): void {
    this.electronRemote.getCurrentWindow().minimize();
  }

  maximizeWindow(): void {
    this.electronRemote.getCurrentWindow().maximize();
  }

  unmaximizeWindow(): void {
    this.electronRemote.getCurrentWindow().unmaximize();
  }

}
