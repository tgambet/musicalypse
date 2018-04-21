import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';

import {routes} from './routes';

import {CoreModule} from './core/core.module';
import {AppComponent} from './core/components/app.component';
import {LibraryModule} from './library/library.module';
import {SettingsModule} from './settings/settings.module';
import {metaReducers, reducers} from './reducers';

@NgModule({
  imports: [
    // Angular Modules
    RouterModule.forRoot(routes),

    // Ngrx Modules
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument(),

    // My Modules
    CoreModule,
    LibraryModule,
    SettingsModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
