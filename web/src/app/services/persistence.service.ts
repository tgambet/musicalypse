import { Injectable } from '@angular/core';

@Injectable()
export class PersistenceService {

  constructor() { }

  static save(key: string, value: string) {
    window.localStorage.setItem(key, value);
  }

  static load(key: string): string {
    return window.localStorage.getItem(key);
  }

}
