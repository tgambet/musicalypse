import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {routes} from './routes';

import {CoreModule} from './core/core.module';
import {AppComponent} from './core/components/app/app.component';
import {LibraryModule} from './library/library.module';
import {SettingsModule} from './settings/settings.module';


@NgModule({
  imports: [
    // Angular Modules
    RouterModule.forRoot(routes),

    // My Modules
    CoreModule,
    LibraryModule,
    SettingsModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
