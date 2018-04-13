import {NgModule} from '@angular/core';

import {SharedModule} from '@app/shared/shared.module';

import {ComponentsModule} from './components/components.module';
import {FavoritesService} from './services/favorites.service';
import {LibraryService} from './services/library.service';

@NgModule({
  imports: [
    SharedModule,
    ComponentsModule
  ],
  providers: [
    LibraryService,
    FavoritesService
  ]
})
export class LibraryModule {}
