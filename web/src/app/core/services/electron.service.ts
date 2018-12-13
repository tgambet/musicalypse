import {Injectable} from '@angular/core';
import {environment} from '@env/environment';

@Injectable()
export class ElectronService {

  private ipcRenderer: any;
  private remote: any;
  private shell: any;

  constructor() {
    if (environment.electron) {
      const electron = (<any>window).require('electron');
      this.ipcRenderer = electron.ipcRenderer;
      this.remote = electron.remote;
      this.shell = electron.shell;
    }
  }

  onIpc(channel: string, listener: (event, ...args) => void): void {
    if (environment.electron) {
      this.ipcRenderer.on(channel, listener);
    }
  }

  removeIpc(channel?: string): void {
    if (environment.electron) {
      this.ipcRenderer.removeAllListeners(channel);
    }
  }

  send(message: string): void {
    if (environment.electron) {
      this.ipcRenderer.send(message);
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

  openExternal(url: string): void {
    this.shell.openExternal(url);
  }

}
