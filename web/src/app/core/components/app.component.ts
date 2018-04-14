import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {LibraryService} from '@app/library/services/library.service';
import {LoaderService} from '@app/core/services/loader.service';
import {SettingsService} from '@app/core/services/settings.service';
import {AudioComponent} from '@app/core/components/audio/audio.component';
import {environment} from '@env/environment';
import {select, Store} from '@ngrx/store';

import * as fromRoot from '../../reducers';
import {Observable} from 'rxjs';
import * as LayoutActions from '@app/core/actions/layout';
import {Theme} from '@app/model';

@Component({
  selector: 'app-root',
  template: `
    <div ngClass="mat-typography main-wrapper"
         [class]="settings.currentTheme.cssClass"
         [class.focused]="isElectronFocused"
         [class.electron]="isElectron">

      <app-toolbar [sideNavOpened]="showSidenav$ | async"
                   [themes]="featuredThemes"
                   [currentTheme]="settings.currentTheme"
                   (changeTheme)="changeTheme($event)"
                   (toggleSideNav)="toggleSideNav()"></app-toolbar>

      <mat-progress-bar
        class="main-loader"
        mode="indeterminate"
        [class.show]="isLoading()"></mat-progress-bar>

      <app-side-menu
        [sideNavOpened]="showSidenav$ | async"
        (closeSideNav)="closeSideNav()"
        (toggleSideNav)="toggleSideNav()"></app-side-menu>

      <mat-sidenav-container>

        <mat-sidenav [opened]="showSidenav$ | async" [mode]="'over'">
          <app-side-nav [playing]="false"></app-side-nav>
        </mat-sidenav>

        <router-outlet></router-outlet>

      </mat-sidenav-container>

    </div>

    <app-audio #audio></app-audio>
  `,
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('audio')
  audio: AudioComponent;

  showSidenav$: Observable<boolean>;

  isElectron = environment.electron;
  isElectronFocused: boolean;

  themeClass: string;
  featuredThemes: Theme[];

  constructor(
    private library: LibraryService,
    public settings: SettingsService,
    private ref: ChangeDetectorRef,
    private store: Store<fromRoot.State>,
    private loader: LoaderService
  ) {
    if (environment.electron) {
      const ipc = environment.electron ? (<any>window).require('electron').ipcRenderer : null;
      ipc.on('focus', () => {
        this.isElectronFocused = true;
        ref.detectChanges();
      });
      ipc.on('blur', () => {
        this.isElectronFocused = false;
        ref.detectChanges();
      });
    }
    this.showSidenav$ = this.store.pipe(select(fromRoot.getShowSidenav));
    this.featuredThemes = this.settings.featuredThemes;
  }

  ngOnInit() {
    this.library.setAudioComponent(this.audio);
    this.themeClass = this.settings.currentTheme.cssClass;
  }

  isLoading() {
    return this.loader.isLoading();
  }

  openSideNav() {
    this.store.dispatch(new LayoutActions.OpenSidenav());
  }

  closeSideNav() {
    this.store.dispatch(new LayoutActions.CloseSidenav());
  }

  toggleSideNav() {
    this.store.dispatch(new LayoutActions.ToggleSidenav());
  }

  changeTheme(theme: Theme) {
    this.settings.changeTheme(theme);
  }

}
