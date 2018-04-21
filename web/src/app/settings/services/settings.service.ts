import {Injectable, OnDestroy} from '@angular/core';
import {HttpEvent, HttpEventType} from '@angular/common/http';
import {MatSnackBar} from '@angular/material';
import {Subscription} from 'rxjs';
import * as _ from 'lodash';

import {HttpSocketClientService} from '@app/core/services/http-socket-client.service';

@Injectable()
export class SettingsService implements OnDestroy {

  uploadSubscription: Subscription;

  files: { _file: File, progress: number }[] = [];

  warnOnMissingTags = false;

  constructor(
    public httpSocketClient: HttpSocketClientService,
    public snackBar: MatSnackBar
  ) {

  }

  ngOnDestroy(): void {
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
    }
  }

  isUploading(): boolean {
    return this.uploadSubscription != null;
  }

  cancelUpload() {
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
      this.uploadSubscription = null;
      this.files = [];
      this.snackBar.open('Upload has been canceled.', '', {duration: 2000});
    }
  }

  clearUploads() {
    if (!this.uploadSubscription) {
      this.files = [];
    }
  }

  uploadFiles() {
    if (this.uploadSubscription) {
      throw new Error('An upload is already in progress!');
    }
    const files: File[] = _.map(this.files, '_file');
    // TODO filter out files with progress below 100%
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
        // this.files = [];
      },
      () => {
        this.snackBar.open(`${this.files.length} file(s) uploaded successfully.`, '', {duration: 2000});
        this.uploadSubscription.unsubscribe();
        this.uploadSubscription = null;
        this.files = [];
      }
    );
  }

  // geLibraryFolders(): Observable<string[]> {
  //   return this.httpSocketClient.get('/api/libraries')
  //     .publishLast()
  //     .refCount() as Observable<string[]>;
  // }
  //
  // addLibraryFolder(folder: string): Observable<void> {
  //   return this.httpSocketClient
  //     .post('/api/libraries', folder)
  //     .map(() => {}); // as Observable<void>
  // }
  //
  // removeLibraryFolder(folder: string): Observable<void> {
  //   return this.httpSocketClient
  //     ._delete('/api/libraries/' + encodeURIComponent(folder))
  //     .map(() => {});
  // }

}


