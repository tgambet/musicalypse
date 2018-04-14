// import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
// import {MatSidenav} from '@angular/material';
// import {environment} from '@env/environment';
//
// import {LibraryService} from '@app/library/services/library.service';
// import {AudioComponent} from '../audio/audio.component';
// import {SettingsService} from '../../services/settings.service';
// import {LoaderService} from '../../services/loader.service';
//
// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.scss']
// })
// export class AppComponent implements OnInit, AfterViewInit {
//
//   private static electron = environment.electron ? (<any>window).require('electron').remote : null;
//
//   @ViewChild('sidenav')
//   sidenav: MatSidenav;
//
//   @ViewChild('audio')
//   audio: AudioComponent;
//
//   themeChooser = false;
//
//   isElectron = environment.electron;
//   isElectronFocused: boolean;
//
//   application = AppComponent;
//
//   constructor(
//     public library: LibraryService,
//     public settings: SettingsService,
//     private ref: ChangeDetectorRef,
//     public loader: LoaderService // wrong IDE warning, don't remove
//   ) {
//
//     if (environment.electron) {
//       const ipc = environment.electron ? (<any>window).require('electron').ipcRenderer : null;
//       ipc.on('focus', () => {
//         this.isElectronFocused = true;
//         ref.detectChanges();
//       });
//       ipc.on('blur', () => {
//         this.isElectronFocused = false;
//         ref.detectChanges();
//       });
//     }
//   }
//
//   static close() {
//     this.electron.getCurrentWindow().close();
//   }
//
//   static minimize() {
//     this.electron.getCurrentWindow().minimize();
//   }
//
//   static maximize() {
//     this.electron.getCurrentWindow().maximize();
//   }
//
//   static unmaximize() {
//     this.electron.getCurrentWindow().unmaximize();
//   }
//
//   static isMaximized(): boolean {
//     return this.electron.getCurrentWindow().isMaximized();
//   }
//
//   ngOnInit(): void {
//
//     this.library.setAudioComponent(this.audio);
//
//     // this.loader.load();
//     // this.library.updateTracks().then(() => this.loader.unload());
//
//     // const a = this.library.scanTracks();
//     //
//     // const b = a.subscribe(track => console.log(track));
//     //
//     // // a.connect();
//     //
//     // setTimeout(() => b.unsubscribe())
//
//     // this.sidenav.open();
//     // this.httpSocketClient.openSocket();
//
//     // console.log(this.httpClient.isSocketOpen())
//     //
//     // const s = this.httpClient.getSocket();
//     //
//     // console.log(this.httpClient.isSocketOpen())
//     //
//     // const b = s.subscribe();
//     //
//     // console.log(this.httpClient.isSocketOpen())
//     //
//     // setTimeout(() => {
//     //   console.log(this.httpClient.isSocketOpen())
//     //
//     //   b.unsubscribe()
//     //
//     //   console.log(this.httpClient.isSocketOpen())
//     // }, 5000);
//
//
//
//   }
//
//   ngAfterViewInit(): void {
//
//   }
//
// }
