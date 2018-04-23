import {environment} from '@env/environment';

export class CoreUtils {

  static allThemes: Theme[] = [
    {name: 'Dark/Green', cssClass: 'dark-theme', color: '#212121'},
    {name: 'Light/Blue', cssClass: 'light-theme', color: '#F5F5F5'},
    {name: 'Blue/Orange', cssClass: 'blue-theme', color: '#263238'},
    {name: 'Pink', cssClass: 'pink-theme', color: '#F8BBD0'}
  ];

  static featuredThemes: Theme[] = CoreUtils.allThemes.slice(0, 4);

  static save(key: string, value: string) {
    window.localStorage.setItem(key, value);
  }

  static load(key: string): string {
    return window.localStorage.getItem(key);
  }

  static resolveUrl(sourceUrl: string) {
    if (environment.electron) {
      return 'http://localhost:' + environment.httpPort + encodeURI(sourceUrl);
    } else if (environment.production) {
      return encodeURI(sourceUrl);
    } else {
      return `${window.location.protocol}//${window.location.hostname}:${environment.httpPort}${encodeURI(sourceUrl)}`;
    }
  }

}

export class Theme {
  name: string;
  cssClass: string;
  color: string;
}
