// import {async, TestBed} from '@angular/core/testing';
// import {AppComponent} from './app.component';
// import * as Material from '@angular/material';
// import {RouterModule, Routes} from '@angular/router';
// import {AudioComponent} from '../audio/audio.component';
// import {LibraryService} from '../../../library/services/library.service';
// import {HttpSocketClientService} from '../../services/http-socket-client.service';
// import {HttpClientModule} from '@angular/common/http';
// import {LoaderService} from '../../services/loader.service';
// import {SettingsService} from '../../services/settings.service';
// import {AboutComponent} from '../about/about.component';
// import {SettingsComponent} from '../../../settings/components/settings.component';
// import {LibraryComponent} from '../../../library/components/library/library.component';
// import {PlayerComponent} from '../../../library/components/player/player.component';
// import {TimePipe} from '../../../shared/pipes/time.pipe';
// import {ArtistsComponent} from '../../../library/components/artists/artists.component';
// import {AlbumsComponent} from '../../../library/components/albums/albums.component';
// import {TracksComponent} from '../../../library/components/tracks/tracks.component';
// import {FolderComponent} from '../../../shared/dialogs/folder/folder.component';
// import {FileSizePipe} from '../../../shared/pipes/file-size.pipe';
// import {ConfirmComponent} from '../../../shared/dialogs/confirm/confirm.component';
// import {MiniPlayerComponent} from '../../../library/components/mini-player/mini-player.component';
// import {DetailsComponent} from '../../../shared/dialogs/details/details.component';
// import {SearchPipe} from '../../../shared/pipes/search.pipe';
// import {FormsModule} from '@angular/forms';
// import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
// import {BrowserModule} from '@angular/platform-browser';
// import {APP_BASE_HREF} from '@angular/common';
//
// const appRoutes: Routes = [
//   { path: '',   redirectTo: '/library', pathMatch: 'full' },
//   { path: 'library', component: LibraryComponent },
//   { path: 'settings', component: SettingsComponent },
//   { path: 'about', component: AboutComponent },
// ];
//
// describe('AppComponent', () => {
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [
//         AppComponent,
//         AudioComponent,
//         TimePipe,
//         PlayerComponent,
//         ArtistsComponent,
//         AlbumsComponent,
//         TracksComponent,
//         SearchPipe,
//         DetailsComponent,
//         FolderComponent,
//         LibraryComponent,
//         AboutComponent,
//         SettingsComponent,
//         FileSizePipe,
//         ConfirmComponent,
//         MiniPlayerComponent
//       ],
//       imports: [
//         BrowserModule,
//         BrowserAnimationsModule,
//         FormsModule,
//         HttpClientModule,
//         RouterModule.forRoot(appRoutes),
//         Material.MatChipsModule,
//         Material.MatRadioModule,
//         Material.MatSlideToggleModule,
//         Material.MatGridListModule,
//         Material.MatDialogModule,
//         Material.MatSnackBarModule,
//         Material.MatButtonModule,
//         Material.MatProgressSpinnerModule,
//         Material.MatProgressBarModule,
//         Material.MatTabsModule,
//         Material.MatFormFieldModule,
//         Material.MatSelectModule,
//         Material.MatInputModule,
//         Material.MatSliderModule,
//         Material.MatListModule,
//         Material.MatTooltipModule,
//         Material.MatCheckboxModule,
//         Material.MatMenuModule,
//         Material.MatSidenavModule,
//         Material.MatToolbarModule,
//         Material.MatIconModule
//       ],
//       providers: [
//         LibraryService,
//         HttpSocketClientService,
//         LoaderService,
//         SettingsService,
//         {provide: APP_BASE_HREF, useValue : '/' }
//       ]
//     }).compileComponents();
//   }));
//   it('should create the app', async(() => {
//     const fixture = TestBed.createComponent(AppComponent);
//     const app = fixture.debugElement.componentInstance;
//     expect(app).toBeTruthy();
//   }));
//   // it(`should have as title 'app'`, async(() => {
//   //   const fixture = TestBed.createComponent(AppComponent);
//   //   const app = fixture.debugElement.componentInstance;
//   //   expect(app.title).toEqual('app');
//   // }));
//   it('should render title in a h1 tag', async(() => {
//     const fixture = TestBed.createComponent(AppComponent);
//     fixture.detectChanges();
//     const compiled = fixture.debugElement.nativeElement;
//     expect(compiled.querySelector('h1').textContent).toContain('Musicalypse');
//   }));
// });
