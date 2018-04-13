import {NgModule, Optional, SkipSelf} from '@angular/core';

import {SharedModule} from '@app/shared/shared.module';

import {AppComponent} from './components/app/app.component';
import {AboutComponent} from './components/about/about.component';
import {AudioComponent} from './components/audio/audio.component';

import {LoaderService} from './services/loader.service';
import {HttpSocketClientService} from './services/http-socket-client.service';
import {PersistenceService} from './services/persistence.service';
import {SettingsService} from './services/settings.service';
// TODO
import {LibraryService} from '@app/library/services/library.service';

export const COMPONENTS = [
  AppComponent,
  AudioComponent,
  AboutComponent,
];

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
  providers: [
    HttpSocketClientService,
    LoaderService,
    PersistenceService,
    LibraryService,
    SettingsService
  ]
})
export class CoreModule {
  constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule');
    }
  }
}
