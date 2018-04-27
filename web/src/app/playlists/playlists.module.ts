import {NgModule} from '@angular/core';
import {SharedModule} from '@app/shared/shared.module';

import {PlaylistsComponent} from './playlists.component';

export const COMPONENTS = [
  PlaylistsComponent
];

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class PlaylistsModule {

}
