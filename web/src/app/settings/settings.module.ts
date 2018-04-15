import {NgModule} from '@angular/core';
import {SharedModule} from '@app/shared/shared.module';
import {SettingsComponent} from './components/settings.component';
import {SettingsService} from './services/settings.service';

export const COMPONENTS = [
  SettingsComponent
];

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
  providers: [
    SettingsService
  ]
})
export class SettingsModule {}
