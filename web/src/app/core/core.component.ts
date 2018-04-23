import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Renderer2} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {environment} from '@env/environment';

import {LoaderService} from './services/loader.service';
import {PersistenceService} from './services/persistence.service';
import {AudioService} from './services/audio.service';
import {LibraryService} from '../library/services/library.service';

import {Theme, Themes} from './utils/themes';
import * as fromRoot from '../app.reducers';
import * as LayoutActions from './core.actions';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

// TODO This should be imported in a library service
import {LoadTracks} from '../library/actions/tracks.actions';
import * as fromLibrary from '../library/library.reducers';
import {SelectArtistsByIds} from '../library/actions/artists.actions';
import {SelectAlbumsByIds} from '../library/actions/albums.actions';

@Component({
  selector: 'app-root',
  template: `
    <div ngClass="mat-typography main-wrapper"
         [class]="currentThemeCssClass$ | async"
         [class.focused]="isElectronFocused"
         [class.electron]="isElectron">

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
                        [class.show]="isLoading()">
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
      mat-sidenav {
        padding-left: 44px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreComponent {

  showSidenav$: Observable<boolean>;
  currentTheme$: Observable<Theme>;
  currentThemeCssClass$: Observable<string>;
  playing$: Observable<boolean>;

  isElectron = environment.electron;
  isElectronFocused: boolean;
  isMaximized = false;
  electronRemote = environment.electron ? (<any>window).require('electron').remote : null;

  featuredThemes: Theme[] = Themes.featuredThemes;

  constructor(
    private library: LibraryService,
    private ref: ChangeDetectorRef,
    private store: Store<fromRoot.State>,
    private loader: LoaderService,
    private audioService: AudioService,
    private renderer: Renderer2,
    private appRoot: ElementRef
  ) {
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

    // Load the last theme
    const savedTheme = PersistenceService.load('theme');
    if (savedTheme) {
      this.changeTheme(JSON.parse(savedTheme));
    }

    // Configure Audio Service
    this.audioService.renderer = renderer;
    this.audioService.appRoot = appRoot;

    // TODO move following in library service

    // Load Tracks
    store.dispatch(new LoadTracks());

    // Restore selection state
    const savedSelectedArtistsIds = PersistenceService.load('selectedArtistsIds');
    if (savedSelectedArtistsIds) {
      this.store.dispatch(new SelectArtistsByIds(JSON.parse(savedSelectedArtistsIds)));
    }
    const savedSelectedAlbumsIds = PersistenceService.load('selectedAlbumsIds');
    if (savedSelectedAlbumsIds) {
      this.store.dispatch(new SelectAlbumsByIds(JSON.parse(savedSelectedAlbumsIds)));
    }

    // Save selection state on change
    this.store.select(fromLibrary.getSelectedArtistsIds).subscribe(
      ids => PersistenceService.save('selectedArtistsIds', JSON.stringify(ids))
    );
    this.store.select(fromLibrary.getSelectedAlbumsIds).subscribe(
      ids => PersistenceService.save('selectedAlbumsIds', JSON.stringify(ids))
    );
  }

  @HostListener('window:storage', ['$event'])
  onStorage(event) {
    if (event.key === 'theme') {
      this.changeTheme(JSON.parse(event.newValue));
    }
  }

  isLoading() {
    return this.loader.isLoading();
  }

  // openSidenav() {
  //   this.store.dispatch(new LayoutActions.OpenSidenav());
  // }

  closeSidenav() {
    this.store.dispatch(new LayoutActions.CloseSidenav());
  }

  toggleSidenav() {
    this.store.dispatch(new LayoutActions.ToggleSidenav());
  }

  changeTheme(theme: Theme) {
    this.store.dispatch(new LayoutActions.ChangeTheme(theme));
  }

  closeWindow() {
    this.electronRemote.getCurrentWindow().close();
  }

  minimizeWindow() {
    this.electronRemote.getCurrentWindow().minimize();
  }

  maximizeWindow() {
    this.electronRemote.getCurrentWindow().maximize();
  }

  unmaximizeWindow() {
    this.electronRemote.getCurrentWindow().unmaximize();
  }

}
