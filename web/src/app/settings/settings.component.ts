import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {SettingsService} from '../services/settings.service';
import {FolderComponent} from '../dialogs/folder/folder.component';
import {LibraryService} from '../services/library.service';
import {HttpSocketClientService} from '../services/http-socket-client.service';
import {ConfirmComponent} from '../dialogs/confirm/confirm.component';
import {LoaderService} from '../services/loader.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  dragOver = false;

  constructor(
    public settings: SettingsService,
    public httpSocketClient: HttpSocketClientService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public library: LibraryService,
    public loader: LoaderService,
    public router: Router
  ) { }

  ngOnInit() {
    this.loader.load();
    this.httpSocketClient.get('/api/libraries').subscribe(
      (result: string[]) => this.settings.libraryFolders = result,
      error => { this.loader.unload(); console.log(error); },
      () => { this.loader.unload(); }
    );
  }

  drop(event) {
    this.addFiles(event.dataTransfer.files);
    this.dragOver = false;
    event.preventDefault();
  }

  addFiles(files: FileList) {
    if (!this.settings.isUploading()) {
      const names = _.map(this.settings.files, f => f._file.name);
      _.forEach(files, (file: File) => {
        if (!_.includes(names, file.name) && file.name.endsWith('.mp3')) {
          this.settings.files.push({_file: file, progress: 0});
        }
      });
    }
  }

  addFolderDialog() {
    const dialogRef = this.dialog.open(FolderComponent, {
      minWidth: '400px'
    });
    dialogRef.afterClosed().subscribe(folder => {
      if (folder) {
        this.settings.addLibraryFolder(folder).then(
          () => this.snackBar.open('Folder ' + folder + ' added to library', '', {duration: 2000}),
          (error) => this.snackBar.open('An error occurred: ' + error.error, '', {duration: 2000})
        );
      }
    });
  }

  removeFolderDialog(folder: string) {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      minWidth: '400px',
      data: { title: 'Please confirm', message: 'Are you sure you want to remove the folder "' + folder + '" from the library?' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.settings.removeLibraryFolder(folder).then(
          () => this.snackBar.open('Folder ' + folder + ' removed from library', '', {duration: 1500}),
          (error) => this.snackBar.open('An error occurred: ' + error.error, '', {duration: 1500})
        );
      }
    });
  }

  requestLibraryScan() {
    this.loader.load();
    this.router.navigate(['/']).then(() => {
      const snackBar = this.snackBar.open('Scanning library...');
      this.library.scanLibrary().then(
        () => {
          snackBar.dismiss();
          this.loader.unload();
        },
        (error) => {
          console.log(error);
          snackBar.dismiss();
          this.loader.unload();
          this.snackBar.open('An error occurred', '', {duration: 2000});
        }
      );
    });
  }

}
