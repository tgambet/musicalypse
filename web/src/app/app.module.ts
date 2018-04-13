import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {AudioComponent} from './audio/audio.component';
import {TimePipe} from './pipes/time.pipe';
import {HttpSocketClientService} from './services/http-socket-client.service';
import {LibraryService} from './services/library.service';
import {PlayerComponent} from './library/player/player.component';
import {ArtistsComponent} from './library/artists/artists.component';
import {AlbumsComponent} from './library/albums/albums.component';
import {TracksComponent} from './library/tracks/tracks.component';
import {SearchPipe} from './pipes/search.pipe';
import {FavoritesService} from './services/favorites.service';
import {DetailsComponent} from './dialogs/details/details.component';
import {FolderComponent} from './dialogs/folder/folder.component';
import {LibraryComponent} from './library/library.component';
import {AboutComponent} from './about/about.component';
import {SettingsComponent} from './settings/settings.component';
import {FileSizePipe} from './pipes/file-size.pipe';
import {SettingsService} from './services/settings.service';
import {ConfirmComponent} from './dialogs/confirm/confirm.component';
import {LoaderService} from './services/loader.service';
import {MiniPlayerComponent} from './library/mini-player/mini-player.component';
import {AppRoutingModule} from './app-routing.module';
import {MaterialModule} from './material';


@NgModule({
  declarations: [
    AppComponent,
    AudioComponent,
    TimePipe,
    PlayerComponent,
    ArtistsComponent,
    AlbumsComponent,
    TracksComponent,
    SearchPipe,
    DetailsComponent,
    FolderComponent,
    LibraryComponent,
    AboutComponent,
    SettingsComponent,
    FileSizePipe,
    ConfirmComponent,
    MiniPlayerComponent
  ],
  entryComponents: [
    DetailsComponent,
    FolderComponent,
    ConfirmComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MaterialModule
  ],
  providers: [
    HttpSocketClientService,
    LibraryService,
    FavoritesService,
    SettingsService,
    LoaderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
