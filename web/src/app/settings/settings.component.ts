import {Component, OnInit} from '@angular/core';
import {HttpEvent, HttpEventType} from '@angular/common/http';
import {Router} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {SettingsService} from '../services/settings.service';
import {FolderComponent} from '../dialogs/folder/folder.component';
import {LibraryService} from '../services/library.service';
import {HttpSocketClientService} from '../services/http-socket-client.service';
import {ConfirmComponent} from '../dialogs/confirm/confirm.component';
import {Subscription} from 'rxjs/Subscription';
import * as _ from 'lodash';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  files: { _file: File, progress: number }[] = [];

  dragOver = false;

  uploadSubscription: Subscription;

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

  isUploading(): boolean {
    return this.uploadSubscription != null;
  }

  addFiles(files: FileList) {
    if (!this.isUploading()) {
      const names = _.map(this.files, f => f._file.name);
      _.forEach(files, (file: File) => {
        if (!_.includes(names, file.name)) {
          this.files.push({_file: file, progress: 0});
        }
      });
    }
  }

  cancel() {
    this.uploadSubscription.unsubscribe();
    this.uploadSubscription = null;
    this.files = [];
    this.snackBar.open('Upload has been canceled.', '', {duration: 2000});
  }

  clear() {
    this.files = [];
  }

  // TODO: refactor out inside the settings service
  uploadFiles() {
    const files: File[] = _.map(this.files, '_file');
    this.uploadSubscription = this.httpSocketClient.postFiles('/api/upload', files).subscribe(
      (next: { event: HttpEvent<any>, file?: File } | null) => {
        switch (next.event.type) {
          case HttpEventType.Sent:
            break;
          case HttpEventType.UploadProgress:
            const currentFile: { _file: File, progress: number } =
              _.filter(this.files, f => f._file === next.file)[0];
            currentFile.progress = next.event.loaded / next.event.total * 100;
            break;
          case HttpEventType.ResponseHeader:
            break;
          case HttpEventType.DownloadProgress:
            break;
          case HttpEventType.Response:
            break;
        }
      },
      error => {
        this.snackBar.open(`An error occurred!`, '', {duration: 2000});
        console.log(error);
        this.uploadSubscription.unsubscribe();
        this.uploadSubscription = null;
        this.files = [];
      },
      () => {
        console.log('complete');
        this.uploadSubscription.unsubscribe();
        this.uploadSubscription = null;
        this.snackBar.open(`${this.files.length} file(s) uploaded successfully.`, '', {duration: 2000});
        this.files = [];
      }
    );
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
