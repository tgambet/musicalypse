import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material';
import {BreakpointObserver} from '@angular/cdk/layout';
import {LibraryService} from './services/library.service';
import {AudioComponent} from './audio/audio.component';
import {SettingsService} from './services/settings.service';
import {environment} from '../environments/environment';
import {LoaderService} from './services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  private static electron = environment.electron ? (<any>window).require('electron').remote : null;

  @ViewChild('sidenav')
  sidenav: MatSidenav;

  @ViewChild('audio')
  audio: AudioComponent;

  themeChooser = false;
  showSidenav: boolean;

  isElectron = environment.electron;

  application = AppComponent;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public library: LibraryService,
    public settings: SettingsService,
    public loader: LoaderService
  ) {
  }

  static close() {
    this.electron.getCurrentWindow().close();
  }

  static minimize() {
    this.electron.getCurrentWindow().minimize();
  }

  static maximize() {
    this.electron.getCurrentWindow().maximize();
  }

  static unmaximize() {
    this.electron.getCurrentWindow().unmaximize();
  }

  static isMaximized(): boolean {
    return this.electron.getCurrentWindow().isMaximized();
  }

  ngOnInit(): void {

    this.breakpointObserver.observe('(max-width: 599px)').subscribe(result => {
      this.showSidenav = result.matches;
      if (!this.showSidenav) {
        this.sidenav.close();
      }
    });

    this.library.setAudioComponent(this.audio);

    // this.loader.load();
    // this.library.updateTracks().then(() => this.loader.unload());

    // const a = this.library.scanTracks();
    //
    // const b = a.subscribe(track => console.log(track));
    //
    // // a.connect();
    //
    // setTimeout(() => b.unsubscribe())

    // this.sidenav.open();
    // this.httpSocketClient.openSocket();

    // console.log(this.httpClient.isSocketOpen())
    //
    // const s = this.httpClient.getSocket();
    //
    // console.log(this.httpClient.isSocketOpen())
    //
    // const b = s.subscribe();
    //
    // console.log(this.httpClient.isSocketOpen())
    //
    // setTimeout(() => {
    //   console.log(this.httpClient.isSocketOpen())
    //
    //   b.unsubscribe()
    //
    //   console.log(this.httpClient.isSocketOpen())
    // }, 5000);



  }

  ngAfterViewInit(): void {

  }

}
