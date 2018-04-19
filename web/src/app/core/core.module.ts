import {NgModule, Optional, SkipSelf} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';

import {SharedModule} from '@app/shared/shared.module';

import {AppComponent} from './components/app.component';
import {AboutComponent} from './components/about/about.component';
import {SideMenuComponent} from './components/sidemenu.component';
import {SidenavComponent} from './components/sidenav.component';
import {ToolbarComponent} from './components/toolbar.component';

import {LoaderService} from './services/loader.service';
import {HttpSocketClientService} from './services/http-socket-client.service';
import {PersistenceService} from './services/persistence.service';

import {CoreEffects} from './core.effects';

// TODO
import {LibraryService} from '@app/library/services/library.service';
import {AudioService} from '@app/core/services/audio.service';

export const COMPONENTS = [
  AppComponent,
  AboutComponent,
  SideMenuComponent,
  SidenavComponent,
  ToolbarComponent
];

@NgModule({
  imports: [
    SharedModule,
    EffectsModule.forFeature([CoreEffects]),
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
  providers: [
    HttpSocketClientService,
    LoaderService,
    PersistenceService,
    LibraryService,
    AudioService
  ]
})
export class CoreModule {
  constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule');
    }
  }
}
