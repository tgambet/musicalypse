import {NgModule} from '@angular/core';

import {SharedModule} from '@app/shared/shared.module';
import {FavoritesService} from './services/favorites.service';
import {LibraryService} from './services/library.service';
import {DictionaryComponent} from '@app/library/components/shared/dictionary.component';
import {MiniPlayerComponent} from '@app/library/components/mini-player/mini-player.component';
import {PlayerComponent} from '@app/library/components/player/player.component';
import {AlbumsComponent} from '@app/library/components/albums/albums.component';
import {ArtistsComponent} from '@app/library/components/artists/artists.component';
import {LibraryComponent} from '@app/library/components/library/library.component';
import {TracksComponent} from '@app/library/components/tracks/tracks.component';
import {ControlsComponent} from '@app/library/components/shared/controls.component';
import {ChipsComponent} from '@app/library/components/shared/chips.component';
import {ListItemComponent} from '@app/library/components/shared/list-item.component';

export const COMPONENTS = [
  AlbumsComponent,
  ArtistsComponent,
  LibraryComponent,
  MiniPlayerComponent,
  PlayerComponent,
  TracksComponent,
  DictionaryComponent,
  ControlsComponent,
  ChipsComponent,
  ListItemComponent
];

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
  providers: [
    LibraryService,
    FavoritesService
  ]
})
export class LibraryModule {}
