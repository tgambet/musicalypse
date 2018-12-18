import {environment} from '@env/environment';
import {Observable, Subscription} from 'rxjs';

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

  static remove(key: string) {
    window.localStorage.removeItem(key);
  }

  static load(key: string): string {
    return window.localStorage.getItem(key);
  }

  static restoreAndSave<T>(id: string, onLoad: (saved: T) => void, saveWhen: Observable<T>, ifNotLoaded?: () => void): Subscription {
    const savedItem = CoreUtils.load(id);
    if (savedItem) {
      try {
        onLoad(JSON.parse(savedItem));
      } catch (e) {
        console.log(e);
      }
    } else {
      if (ifNotLoaded) { ifNotLoaded(); }
    }
    return saveWhen.subscribe(
      elem => CoreUtils.save(id, JSON.stringify(elem))
    );
  }

  static resolveUrl(sourceUrl: string) {
    if (environment.electron) {
      return 'http://localhost:' + environment.httpPort + sourceUrl;
    } else if (environment.production) {
      return sourceUrl;
    } else {
      return `${window.location.protocol}//${window.location.hostname}:${environment.httpPort}${sourceUrl}`;
    }
  }

  static isScrolledIntoView(el: Element, refElement: Element = null): boolean {
    const rect = el.getBoundingClientRect();
    const elemTop = rect.top;
    const elemBottom = rect.bottom;
    if (refElement) {
      const refRect = refElement.getBoundingClientRect();
      const refTop = refRect.top;
      const refBottom = refRect.bottom;
      return (elemTop >= refTop) && (elemBottom <= refBottom);
    }
    return (elemTop >= 0) && (elemBottom <= window.innerHeight);
  }

  static isHorizontallyVisible(el: Element): boolean {
    const rect = el.getBoundingClientRect();
    const elemLeft = rect.left;
    return elemLeft < window.innerWidth;
  }

}

export class Theme {
  name: string;
  cssClass: string;
  color: string;
}
