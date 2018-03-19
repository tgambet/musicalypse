import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import * as _ from 'lodash';
import {SettingsService} from '../services/settings.service';
import {FolderComponent} from '../dialogs/folder/folder.component';
import {LibraryService} from '../services/library.service';
import {HttpSocketClientService} from '../services/http-socket-client.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  files: File[] = [];

  constructor(
    public settings: SettingsService,
    public httpSocketClient: HttpSocketClientService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public library: LibraryService,
    public router: Router
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

  requestLibraryScan() {
    this.router.navigate(['/']);
    const snackBar = this.snackBar.open('Scanning library...');
    this.library.scanLibrary().then(
      () => snackBar.dismiss(),
      (error) => {
        console.log(error);
        snackBar.dismiss();
        this.snackBar.open('An error occurred');
      }
    );
  }

}
