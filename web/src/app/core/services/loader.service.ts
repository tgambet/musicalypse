import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class LoaderService {

  private loadings = 0;
  private loadings$: Observable<boolean>;
  private loadingSubject = new Subject<boolean>();

  constructor() {
    this.loadings$ = this.loadingSubject.asObservable();
  }

  isLoading(): Observable<boolean> {
    return this.loadings$;
  }

  load() {
    this.loadings += 1;
    this._update();
  }

  unload() {
    this.loadings -= 1;
    this._update();
  }

  private _update() {
    if (this.loadings > 0) {
      this.loadingSubject.next(true);
    } else {
      this.loadingSubject.next(false);
    }
  }

}
