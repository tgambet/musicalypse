import { Component, OnInit } from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import * as _ from 'lodash';
import {SettingsService} from '../services/settings.service';
import {FolderComponent} from '../dialogs/folder/folder.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  files: File[] = [];

  constructor(
    public settings: SettingsService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar
  ) { }

  ngOnInit() {
  }

  addFiles(files: FileList) {
    _.forEach(files, (file: File) => {
      const names = _.map(this.files, 'name');
      if (!_.includes(names, file.name)) {
        this.files.push(file);
      }
    });
  }

  cancel() {
    this.files = [];
  }

  openFolderAddDialog() {
    const dialogRef = this.dialog.open(FolderComponent, {
      minWidth: '400px'
    });
    dialogRef.afterClosed().subscribe(folder => {
      if (folder) {
        this.settings.addLibraryFolder(folder).then(
          () => this.snackBar.open('Folder ' + folder + ' added to library', '', {duration: 1500}),
          (error) => this.snackBar.open('An error occurred: ' + error.error, '', {duration: 1500})
        );
      }
    });
  }

}
