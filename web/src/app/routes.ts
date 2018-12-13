import {Routes} from '@angular/router';
import {LibraryComponent} from './library/library.component';
import {SettingsComponent} from './settings/settings.component';
import {AboutComponent} from './core/components/about.component';
import {PlayerComponent} from '@app/player/player.component';
// import {MyMusicComponent} from '@app/my-music/my-music.component';
import {PlaylistsComponent} from '@app/playlists/playlists.component';
// import {EditorComponent} from '@app/editor/editor.component';

export const routes: Routes = [
  { path: '', redirectTo: '/library', pathMatch: 'full' },
  { path: 'playing', component: PlayerComponent },
  // { path: 'mymusic', component: MyMusicComponent },
  { path: 'playlists', component: PlaylistsComponent },
  { path: 'library', component: LibraryComponent },
  { path: 'recent', component: LibraryComponent, data: { recent: true } },
  { path: 'favorites', component: LibraryComponent, data: { favorites: true } },
  // { path: 'editor', component: EditorComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'about', component: AboutComponent },
];
