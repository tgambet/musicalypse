import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material';
import {BreakpointObserver} from '@angular/cdk/layout';
import {LibraryService} from './services/library.service';
import {AudioComponent} from './audio/audio.component';
import {SettingsService} from './services/settings.service';

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
  showSidenav: boolean;

  // private id = 0;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public library: LibraryService,
    public settings: SettingsService
  ) {
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

    this.library.setAudioComponent(this.audio);
  }

  ngAfterViewInit(): void {

  }

  // scanLibrary() {
  //   this.library.reset();
  //   const snackBar = this.snackBar.open('Scanning library...');
  //   const currentId = ++this.id;
  //   const subscription1 = this.httpSocketClient
  //     .openSocket()
  //     .filter((r: SocketMessage) => r.method === 'TrackAdded' && r.id === currentId)
  //     .map((r: SocketMessage) => r.entity)
  //     .map((e: Track) => e)
  //     .subscribe(
  //       track => this.library.addTrack(track),
  //       error => {
  //         console.log(error);
  //         snackBar.dismiss();
  //         this.snackBar.open('An error occurred');
  //       }
  //     );
  //
  //   this.httpSocketClient
  //     .openSocket()
  //     .filter((r: SocketMessage) => r.method === 'LibraryScanned' && r.id === currentId)
  //     .take(1)
  //     .subscribe(() => {
  //       snackBar.dismiss();
  //       subscription1.unsubscribe();
  //     });
  //
  //   this.httpSocketClient.send({method: 'ScanLibrary', id: currentId, entity: null});
  // }

}
