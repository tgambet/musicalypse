import {NgModule} from '@angular/core';
import {SharedModule} from '@app/shared/shared.module';

import {EditorComponent} from './editor.component';

export const COMPONENTS = [
  EditorComponent
];

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class EditorModule {

}
