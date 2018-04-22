import {Routes} from '@angular/router';
import {LibraryComponent} from './library/components/library.component';
import {SettingsComponent} from './settings/components/settings.component';
import {AboutComponent} from './core/components/about.component';

export const routes: Routes = [
  { path: '',   redirectTo: '/library', pathMatch: 'full' },
  { path: 'library', component: LibraryComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'about', component: AboutComponent },
];
