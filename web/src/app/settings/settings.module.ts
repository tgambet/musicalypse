import {NgModule} from '@angular/core';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';

import {SharedModule} from '@app/shared/shared.module';

import {LibraryFoldersComponent} from './components/library-folders.component';
import {SettingsComponent} from './settings.component';
import {UploadsComponent} from './components/uploads.component';
import {ThemesComponent} from './components/themes.component';

import {SettingsService} from './services/settings.service';

import {SettingsEffects} from './settings.effects';
import {reducers} from './settings.reducers';
import {LyricsComponent} from '@app/settings/components/lyrics.component';

export const COMPONENTS = [
  SettingsComponent,
  LibraryFoldersComponent,
  UploadsComponent,
  ThemesComponent,
  LyricsComponent
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
