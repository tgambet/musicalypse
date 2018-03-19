import {Injectable} from '@angular/core';
import {OverlayContainer} from '@angular/cdk/overlay';
import {HttpSocketClientService} from './http-socket-client.service';

@Injectable()
export class SettingsService {

  libraryFolders: string[];

  themes: Theme[] = [
    {name: 'Dark Theme', cssClass: 'dark-theme'},
    {name: 'Light Theme', cssClass: 'light-theme'}
  ];

  featuredThemes: Theme[] = this.themes;

  currentTheme: Theme = this.themes[0];

  constructor(
    private overlayContainer: OverlayContainer,
    public httpSocketClient: HttpSocketClientService
  ) {
    overlayContainer.getContainerElement().classList.add(this.currentTheme.cssClass);

    this.httpSocketClient.get('/api/libraries').subscribe(
      (result: string[]) => this.libraryFolders = result,
      error => console.log(error),
      () => {}
    );
  }

  changeTheme(theme: Theme) {
    this.overlayContainer.getContainerElement().classList.remove(this.currentTheme.cssClass);
    this.overlayContainer.getContainerElement().classList.add(theme.cssClass);
    this.currentTheme = theme;
  }

  addLibraryFolder(folder: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpSocketClient.post('/api/libraries/', folder).subscribe(
        () => {
          this.libraryFolders.push(folder);
          resolve();
        },
        error => {
          console.log(error);
          reject(error);
        }
      );
    });
  }

}

export class Theme {
  name: string;
  cssClass: string;
}
