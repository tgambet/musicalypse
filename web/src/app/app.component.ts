import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatSidenav, MatSnackBar} from '@angular/material';
import {OverlayContainer} from '@angular/cdk/overlay';
import {BreakpointObserver} from '@angular/cdk/layout';
import {SocketMessage, Track} from './model';
import {HttpSocketClientService} from './services/http-socket-client.service';
import {LibraryService} from './services/library.service';
import {FolderComponent} from './dialogs/folder/folder.component';
import {AudioComponent} from './library/audio/audio.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('sidenav')
  sidenav: MatSidenav;

  @ViewChild('audio')
  audio: AudioComponent;

  themeChooser = false;
  themeClass = 'dark-theme';
  showSidenav: boolean;
  libraries: string[] = [];

  private id = 0;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private overlayContainer: OverlayContainer,
    public httpSocketClient: HttpSocketClientService,
    public library: LibraryService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    overlayContainer.getContainerElement().classList.add(this.themeClass);
  }

  ngOnInit(): void {
    this.breakpointObserver.observe('(max-width: 599px)').subscribe(result => {
      this.showSidenav = result.matches;
      if (!this.showSidenav) {
        this.sidenav.close();
      }
    });
    // this.sidenav.open();
    // this.httpSocketClient.openSocket();

    this.httpSocketClient.get('/api/libraries').subscribe(
      (result: string[]) => this.libraries = result,
      error => console.log(error),
      () => {}
    );

    this.library.setAudioComponent(this.audio);
  }

  ngAfterViewInit(): void {

  }

  changeTheme(theme: string) {
    this.overlayContainer.getContainerElement().classList.remove(this.themeClass);
    this.overlayContainer.getContainerElement().classList.add(theme);
    this.themeClass = theme;
  }

  scanLibrary() {
    this.library.reset();
    const snackBar = this.snackBar.open('Scanning library...');
    const currentId = ++this.id;
    const subscription1 = this.httpSocketClient
      .openSocket()
      .filter((r: SocketMessage) => r.method === 'TrackAdded' && r.id === currentId)
      .map((r: SocketMessage) => r.entity)
      .map((e: Track) => e)
      .subscribe(
        track => this.library.addTrack(track),
        error => {
          console.log(error);
          snackBar.dismiss();
          this.snackBar.open('An error occurred');
        }
      );

    this.httpSocketClient
      .openSocket()
      .filter((r: SocketMessage) => r.method === 'LibraryScanned' && r.id === currentId)
      .take(1)
      .subscribe(() => {
        snackBar.dismiss();
        subscription1.unsubscribe();
      });

    this.httpSocketClient.send({method: 'ScanLibrary', id: currentId, entity: null});
  }

  openFolderDialog() {
    const dialogRef = this.dialog.open(FolderComponent, {
      minWidth: '400px'
    });
    dialogRef.afterClosed().subscribe(folder => {
      if (folder) {
        this.httpSocketClient.post('/api/libraries/', folder).subscribe(
          () => {
            this.libraries.push(folder);
            this.snackBar.open('Folder ' + folder + ' added to library', '', {duration: 1500});
          },
          error => {
            console.log(error);
            this.snackBar.open('An error occurred: ' + error.error, '', {duration: 1500});
          }
        );
      }
    });
  }

}
