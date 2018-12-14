import {NgModule} from '@angular/core';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';

import {SharedModule} from '@app/shared/shared.module';

import {LibraryService} from './services/library.service';
import {DictionaryComponent} from './components/shared/dictionary.component';
import {MiniPlayerComponent} from './components/mini-player.component';
import {PlayerComponent} from './components/player/player.component';
import {AlbumsComponent} from './components/albums.component';
import {ArtistsComponent} from './components/artists.component';
import {LibraryComponent} from './library.component';
import {TracksComponent} from './components/tracks.component';
import {ControlsComponent} from './components/shared/controls.component';
import {ChipsComponent} from './components/shared/chips.component';
import {ListItemComponent} from './components/shared/list-item.component';
import {LoaderComponent} from './components/shared/loader.component';
import {TrackComponent, TrackControlComponent} from './components/track.component';
import {ProgressComponent} from './components/player/progress.component';

import {LibraryEffects} from './library.effects';
import {reducers} from './library.reducers';

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
  ListItemComponent,
  LoaderComponent,
  TrackComponent,
  ProgressComponent,
  TrackControlComponent
];

@NgModule({
  imports: [
    SharedModule,
    StoreModule.forFeature('library', reducers),
    EffectsModule.forFeature([LibraryEffects]),
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
  providers: [
    LibraryService
  ]
})
export class LibraryModule {}
