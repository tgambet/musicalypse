import {NgModule} from '@angular/core';

import {SharedModule} from '@app/shared/shared.module';

import {PlayerComponent} from './player/player.component';
import {MiniPlayerComponent} from './mini-player/mini-player.component';
import {ArtistsComponent} from './artists/artists.component';
import {AlbumsComponent} from './albums/albums.component';
import {TracksComponent} from './tracks/tracks.component';
import {LibraryComponent} from './library/library.component';
import {DictionaryComponent} from '@app/library/components/shared/dictionary.component';

export const COMPONENTS = [
  AlbumsComponent,
  ArtistsComponent,
  LibraryComponent,
  MiniPlayerComponent,
  PlayerComponent,
  TracksComponent,
  DictionaryComponent
];

@NgModule({
  imports: [SharedModule],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class ComponentsModule {}
