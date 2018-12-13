import {Injectable} from '@angular/core';
import {environment} from '@env/environment';

@Injectable()
export class ElectronService {

  private ipcRenderer: any;
  private remote: any;

  constructor() {
    if (environment.electron) {
      const electron = (<any>window).require('electron');
      this.ipcRenderer = electron.ipcRenderer;
      this.remote = electron.remote;
    }
  }

  onIpc(channel: string, listener: () => void): void {
    if (environment.electron) {
      this.ipcRenderer.on(channel, listener);
    }
  }

  onWindow(event: string, listener: () => void): void {
    if (environment.electron) {
      this.remote.getCurrentWindow().addListener(event, listener);
    }
  }

  getWindow(): any {
    if (environment.electron) {
      return this.remote.getCurrentWindow();
    }
  }

}
