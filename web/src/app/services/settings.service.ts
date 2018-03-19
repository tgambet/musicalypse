import {Injectable} from '@angular/core';
import {OverlayContainer} from '@angular/cdk/overlay';

@Injectable()
export class SettingsService {

  themes: Theme[] = [
    {name: 'Dark Theme', cssClass: 'dark-theme'},
    {name: 'Light Theme', cssClass: 'light-theme'}
  ];

  featuredThemes: Theme[] = this.themes;

  currentTheme: Theme = this.themes[0];

  constructor(
    private overlayContainer: OverlayContainer
  ) {
    overlayContainer.getContainerElement().classList.add(this.currentTheme.cssClass);
  }

  changeTheme(theme: Theme) {
    this.overlayContainer.getContainerElement().classList.remove(this.currentTheme.cssClass);
    this.overlayContainer.getContainerElement().classList.add(theme.cssClass);
    this.currentTheme = theme;
  }

}

export class Theme {
  name: string;
  cssClass: string;
}
