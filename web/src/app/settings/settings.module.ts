import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';
import {SharedModule} from '@app/shared/shared.module';
import {SettingsComponent} from './components/settings.component';
import {SettingsService} from './services/settings.service';
import {SettingsEffects} from './settings.effects';
import {StoreModule} from '@ngrx/store';
import {reducers} from './settings.reducers';

export const COMPONENTS = [
  SettingsComponent
];

@NgModule({
  imports: [
    SharedModule,
    StoreModule.forFeature('settings', reducers),
    EffectsModule.forFeature([SettingsEffects]),
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
  providers: [
    SettingsService
  ]
})
export class SettingsModule {}
