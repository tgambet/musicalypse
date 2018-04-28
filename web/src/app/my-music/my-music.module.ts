import {NgModule} from '@angular/core';
import {SharedModule} from '@app/shared/shared.module';

import {MyMusicComponent} from './my-music.component';
import {TracksComponent} from './components/tracks.component';
import {ArtistsComponent} from './components/artists.component';
import {AlbumsComponent} from './components/albums.component';
import {BoxListComponent} from '@app/my-music/components/shared/box-list.component';

export const COMPONENTS = [
  MyMusicComponent,
  TracksComponent,
  ArtistsComponent,
  AlbumsComponent,
  BoxListComponent
];

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class MyMusicModule {

}
