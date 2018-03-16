import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import * as Material from '@angular/material';
import {BreakpointObserver, MediaMatcher} from '@angular/cdk/layout';

import {AppComponent} from './app.component';
import {AudioComponent} from './audio/audio.component';
import {TimePipe} from './pipes/time.pipe';
import {HttpSocketClientService} from './services/http-socket-client.service';
import {LibraryService} from './services/library.service';
import {PlayerComponent} from './player/player.component';
import {ArtistsComponent} from './artists/artists.component';
import {AlbumsComponent} from './albums/albums.component';
import {TracksComponent} from './tracks/tracks.component';
import {FormsModule} from '@angular/forms';
import {SearchPipe} from './pipes/search.pipe';
import {FavoritesService} from './services/favorites.service';

@NgModule({
  declarations: [
    AppComponent,
    AudioComponent,
    TimePipe,
    PlayerComponent,
    ArtistsComponent,
    AlbumsComponent,
    TracksComponent,
    SearchPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    Material.MatSnackBarModule,
    Material.MatButtonModule,
    Material.MatProgressSpinnerModule,
    Material.MatProgressBarModule,
    Material.MatTabsModule,
    Material.MatFormFieldModule,
    Material.MatSelectModule,
    Material.MatInputModule,
    Material.MatSliderModule,
    Material.MatListModule,
    Material.MatTooltipModule,
    Material.MatCheckboxModule,
    Material.MatMenuModule,
    Material.MatSidenavModule,
    Material.MatToolbarModule,
    Material.MatIconModule
  ],
  providers: [
    MediaMatcher,
    BreakpointObserver,
    HttpSocketClientService,
    LibraryService,
    FavoritesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
