import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';


import {MaterialModule} from '@app/shared/material/material.module';
import {FormsModule} from '@angular/forms';
import {ConfirmComponent} from './confirm/confirm.component';
import {DetailsComponent} from './details/details.component';
import {FolderComponent} from './folder/folder.component';
import {PlaylistsComponent} from './playlists.component';

export const COMPONENTS = [
  ConfirmComponent,
  DetailsComponent,
  FolderComponent,
  PlaylistsComponent
];

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    FormsModule
  ],
  entryComponents: COMPONENTS,
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class DialogsModule {}
