import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material';

import {HttpSocketClientService} from '@app/core/services/http-socket-client.service';
import {select, Store} from '@ngrx/store';

import * as fromSettings from '@app/settings/settings.reducers';
import {Observable} from 'rxjs';
import {LyricsOptions} from '@app/model';
import {AddLibraryFolder, LoadLibraryFolders, RemoveLibraryFolder, SetLyricsOptions} from '@app/settings/settings.actions';
import {ScanTracks} from '@app/library/actions/tracks.actions';

@Injectable()
export class SettingsService {

  constructor(
    private httpSocketClient: HttpSocketClientService,
    private snackBar: MatSnackBar,
    private store: Store<fromSettings.State>
  ) {
  }

  getLyricsOptions(): Observable<LyricsOptions> {
    return this.store.select(fromSettings.getLyricsOptions);
  }

  saveLyricsOptions(options: LyricsOptions) {
    this.store.dispatch(new SetLyricsOptions(options));
  }

  getLibraryError(): Observable<string> {
    return this.store.select(fromSettings.getSettingsError);
  }

  getLibraryLoading(): Observable<boolean> {
    return this.store.select(fromSettings.getSettingsLoading);
  }

  getLibraryFolders(): Observable<string[]> {
    return this.store.pipe(select(fromSettings.getLibraryFolders));
  }

  loadLibraryFolders(): void {
    this.store.dispatch(new LoadLibraryFolders());
  }

  addLibraryFolder(folder: string): void {
    this.store.dispatch(new AddLibraryFolder(folder));
  }

  removeLibraryFolder(folder: string): void {
    this.store.dispatch(new RemoveLibraryFolder(folder));
  }

  scanTracks(): void {
    this.store.dispatch(new ScanTracks());
  }

  /*  uploadSubscription: Subscription;

  files: { _file: File, progress: number }[] = [];

  warnOnMissingTags = false;*/

/*  ngOnDestroy(): void {
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
    const files: File[] = this.files.map(file => file._file);
    // TODO filter out files with progress below 100%
    this.uploadSubscription = this.httpSocketClient.postFiles('/api/upload', files).subscribe(
      (next: { event: HttpEvent<any>, file?: File } | null) => {
        switch (next.event.type) {
          case HttpEventType.Sent:
            break;
          case HttpEventType.UploadProgress:
            const currentFile: { _file: File, progress: number } =
              this.files.filter(f => f._file === next.file)[0];
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
  }*/

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


