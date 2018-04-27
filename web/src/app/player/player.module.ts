import {NgModule} from '@angular/core';
import {SharedModule} from '@app/shared/shared.module';

import {PlayerComponent} from './player.component';

export const COMPONENTS = [
  PlayerComponent
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
