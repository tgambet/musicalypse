import {NgModule} from '@angular/core';
import {SharedModule} from '@app/shared/shared.module';

import {MyMusicComponent} from './my-music.component';

export const COMPONENTS = [
  MyMusicComponent
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
