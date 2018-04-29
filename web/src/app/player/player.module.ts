import {NgModule} from '@angular/core';
import {SharedModule} from '@app/shared/shared.module';

import {PlayerComponent} from './player.component';
import {PlayerHeaderComponent} from '@app/player/components/header.component';
import {PlayerProgressComponent} from '@app/player/components/progress.component';
import {PlayerControlsComponent} from '@app/player/components/controls.component';
import {PlayerPlaylistComponent} from '@app/player/components/playlist.component';

export const COMPONENTS = [
  PlayerComponent,
  PlayerHeaderComponent,
  PlayerProgressComponent,
  PlayerControlsComponent,
  PlayerPlaylistComponent
];

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class PlayerModule {

}
