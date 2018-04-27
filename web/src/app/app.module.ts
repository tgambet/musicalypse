import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';

import {routes} from './routes';

import {CoreModule} from './core/core.module';
import {CoreComponent} from './core/core.component';
import {LibraryModule} from './library/library.module';
import {SettingsModule} from './settings/settings.module';
import {metaReducers, reducers} from './app.reducers';
import {environment} from '@env/environment';
import {EditorModule} from '@app/editor/editor.module';
import {MyMusicModule} from '@app/my-music/my-music.module';
import {PlayerModule} from '@app/player/player.module';
import {PlaylistsModule} from '@app/playlists/playlists.module';

@NgModule({
  imports: [
    // Angular Modules
    RouterModule.forRoot(routes),

    // Ngrx Modules
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      maxAge: 50, // Retains last 50 states
      logOnly: environment.production // Restrict extension to log-only mode
    }),

    // My Modules
    CoreModule,
    LibraryModule,
    SettingsModule,
    EditorModule,
    MyMusicModule,
    PlayerModule,
    PlaylistsModule
  ],
  bootstrap: [CoreComponent]
})
export class AppModule { }
