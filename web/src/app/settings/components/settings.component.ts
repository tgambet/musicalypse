import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {FolderComponent} from '@app/shared/dialogs/folder/folder.component';
import {HttpSocketClientService} from '@app/core/services/http-socket-client.service';
import {SettingsService} from '@app/settings/services/settings.service';
import {ConfirmComponent} from '@app/shared/dialogs/confirm/confirm.component';
import {environment} from '@env/environment';
import * as _ from 'lodash';
import {select, Store} from '@ngrx/store';
import * as fromSettings from '../settings.reducers';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AddLibraryFolder, LoadLibraryFolders, RemoveLibraryFolder} from '@app/settings/settings.actions';
import * as LayoutActions from '@app/core/core.actions';
import * as fromRoot from '@app/app.reducers';
import {ScanTracks} from '@app/library/actions/tracks.actions';
import {CoreUtils, Theme} from '@app/core/core.utils';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  themes = CoreUtils.allThemes;

  error$: Observable<string>;
  libraryFolders$: Observable<string[]>;
  libraryFoldersLength$: Observable<number>;
  currentTheme$: Observable<Theme>;

  ipcAddFolder = (event, folder) => this.zone.run(() => this.addLibraryFolder(folder[0]));

  constructor(
    public httpSocketClient: HttpSocketClientService,
    public settings: SettingsService,
    private dialog: MatDialog,
    private router: Router,
    private store: Store<fromSettings.State>,
    private zone: NgZone
  ) {
    this.error$ = this.store.pipe(select(fromSettings.getSettingsError));
    this.libraryFolders$ = this.store.pipe(select(fromSettings.getLibraryFolders));
    this.currentTheme$ = this.store.pipe(select(fromRoot.getCurrentTheme));
    this.libraryFoldersLength$ = this.libraryFolders$.pipe(map(f => f.length));
  }

  ngOnInit() {
    this.store.dispatch(new LoadLibraryFolders());

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
    this.store.dispatch(new AddLibraryFolder(folder));
   }

  removeLibraryFolder(folder: string) {
    this.store.dispatch(new RemoveLibraryFolder(folder));
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
    this.router.navigate(['/']); // .then(() => this.library.scan());
    this.store.dispatch(new ScanTracks());
  }

  changeTheme(theme: Theme) {
    this.store.dispatch(new LayoutActions.ChangeTheme(theme));
  }

}
