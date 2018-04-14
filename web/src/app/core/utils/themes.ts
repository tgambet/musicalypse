export class Themes {

  static allThemes: Theme[] = [
    {name: 'Dark/Green', cssClass: 'dark-theme', color: '#212121'},
    {name: 'Light/Blue', cssClass: 'light-theme', color: '#F5F5F5'},
    {name: 'Blue/Orange', cssClass: 'blue-theme', color: '#263238'},
    {name: 'Pink', cssClass: 'pink-theme', color: '#F8BBD0'}
  ];

  static featuredThemes: Theme[] = Themes.allThemes.slice(0, 4);

}

export class Theme {
  name: string;
  cssClass: string;
  color: string;
}
