import {Injectable, OnDestroy} from '@angular/core';
import {HttpEvent, HttpEventType} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import {MatSnackBar} from '@angular/material';
import {OverlayContainer} from '@angular/cdk/overlay';
import {Observable, Subscription} from 'rxjs';
import {PersistenceService} from './persistence.service';
import 'rxjs/add/operator/publishLast';
import * as _ from 'lodash';

import {HttpSocketClientService} from './http-socket-client.service';

@Injectable()
export class SettingsService implements OnDestroy {

  // libraryFolders: Observable<string[]> = Observable.empty();

  themes: Theme[] = [
    {name: 'Dark/Green', cssClass: 'dark-theme', color: '#212121'},
    {name: 'Light/Blue', cssClass: 'light-theme', color: '#F5F5F5'},
    {name: 'Blue/Orange', cssClass: 'blue-theme', color: '#263238'},
    {name: 'Pink', cssClass: 'pink-theme', color: '#F8BBD0'}
  ];

  featuredThemes: Theme[] = this.themes;

  currentTheme: Theme = this.themes[0];

  uploadSubscription: Subscription;

  files: { _file: File, progress: number }[] = [];

  warnOnMissingTags = false;

  constructor(
    private overlayContainer: OverlayContainer,
    private sanitizer: DomSanitizer,
    public httpSocketClient: HttpSocketClientService,
    public snackBar: MatSnackBar
  ) {
    overlayContainer.getContainerElement().classList.add(this.currentTheme.cssClass);
    const theme = PersistenceService.load('theme');
    if (theme) {
      this.changeTheme(JSON.parse(theme));
    }
    window.addEventListener('storage', e => {
      if (e.key === 'theme') {
        this.changeTheme(JSON.parse(e.newValue));
      }
    });
  }

  ngOnDestroy(): void {
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
    }
  }

  getThemeStyle(theme: Theme) {
    return this.sanitizer.bypassSecurityTrustStyle(`background-color: ${theme.color}`);
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

  changeTheme(theme: Theme) {
    this.overlayContainer.getContainerElement().classList.remove(this.currentTheme.cssClass);
    this.overlayContainer.getContainerElement().classList.add(theme.cssClass);
    this.currentTheme = theme;
    PersistenceService.save('theme', JSON.stringify(theme));
  }

  isCurrentTheme(theme: Theme): boolean {
    return _.isEqual(this.currentTheme, theme);
  }

  geLibraryFolders(): Observable<string[]> {
    return this.httpSocketClient.get('/api/libraries')
      .publishLast()
      .refCount() as Observable<string[]>;
  }

  addLibraryFolder(folder: string): Observable<void> {
    return this.httpSocketClient
      .post('/api/libraries', folder)
      .map(() => {}); // as Observable<void>
  }

  removeLibraryFolder(folder: string): Observable<void> {
    return this.httpSocketClient
      ._delete('/api/libraries/' + encodeURIComponent(folder))
      .map(() => {});
  }

}

export class Theme {
  name: string;
  cssClass: string;
  color: string;
}
