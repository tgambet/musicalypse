import {NgModule} from '@angular/core';
import {SharedModule} from '@app/shared/shared.module';
import {SettingsComponent} from './components/settings.component';

export const COMPONENTS = [
  SettingsComponent
];

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
  providers: []
})
export class SettingsModule {}
