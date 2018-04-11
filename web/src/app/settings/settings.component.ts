import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {SettingsService} from '../services/settings.service';
import {FolderComponent} from '../dialogs/folder/folder.component';
import {LibraryService} from '../services/library.service';
import {HttpSocketClientService} from '../services/http-socket-client.service';
import {ConfirmComponent} from '../dialogs/confirm/confirm.component';
import {environment} from '../../environments/environment';
import * as _ from 'lodash';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  libraryFolders: string[] = [];

  dragOver = false;

  ipcAddFolder = (event, folder) => {
    this.addLibraryFolder(folder[0]);
  }

  constructor(
    public settings: SettingsService,
    public httpSocketClient: HttpSocketClientService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public library: LibraryService,
    public router: Router,
    private ref: ChangeDetectorRef,
  ) {

  }

  ngOnInit() {
    this.settings.geLibraryFolders().subscribe(
      folders => {
        this.libraryFolders = folders;
      }
    );

    if (environment.electron) {
      const ipc = (<any>window).require('electron').ipcRenderer;
      ipc.on('selected-directory', this.ipcAddFolder);
    }
  }

  ngOnDestroy(): void {
    if (environment.electron) {
      const ipc = (<any>window).require('electron').ipcRenderer;
      ipc.removeListener('selected-directory', this.ipcAddFolder);
    }
  }

  addLibraryFolder(folder: string) {
    this.settings.addLibraryFolder(folder).subscribe(
      () => {
        // this.snackBar.open('Folder ' + folder + ' added to library', '', {duration: 2000});
        this.libraryFolders = [folder, ...this.libraryFolders];
      },
      (error) => {
        this.snackBar.open('An error occurred: ' + error.error, '', {duration: 2000});
      },
      () => {
        this.ref.detectChanges();
      }
    );
  }

  removeLibraryFolder(folder: string) {
    this.settings.removeLibraryFolder(folder).subscribe(
      () => {
        this.libraryFolders = _.filter(this.libraryFolders, f => f !== folder);
        this.snackBar.open('Folder ' + folder + ' removed from library', '', {duration: 1500});
      },
      (error) => this.snackBar.open('An error occurred: ' + error.error, '', {duration: 1500})
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
    if (environment.electron) {
      const ipc = (<any>window).require('electron').ipcRenderer;
      ipc.send('open-file-dialog');
    } else {
      const dialogRef = this.dialog.open(FolderComponent, {
        minWidth: '400px'
      });
      dialogRef.afterClosed().subscribe(folder => {
        if (folder) {
          this.addLibraryFolder(folder);
        }
      });
    }
  }

  removeFolderDialog(folder: string) {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      minWidth: '400px',
      data: {
        title: 'Please confirm',
        message: 'Are you sure you want to remove the folder "' + folder + '" from the library?'
      }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.removeLibraryFolder(folder);
      }
    });
  }

  requestLibraryScan() {
    this.router.navigate(['/']).then(() => this.library.scan());
  }

}
