import { Injectable } from '@angular/core';
import {concat, Observable, Subject, throwError} from 'rxjs';
import {delay, publishReplay, refCount, retryWhen, take, tap} from 'rxjs/operators';
import {HttpSocketClientService} from '@app/core/services/http-socket-client.service';

@Injectable()
export class LoaderService {

  private loadings = 0;
  private readonly loadings$: Observable<boolean>;
  private loadingSubject = new Subject<boolean>();

  hasInitializingErrors$: Observable<boolean>;
  private hasInitializingErrorsSubject = new Subject<boolean>();

  initializingLog$: Observable<string>;
  private initializingLogSubject = new Subject<string>();

  initializing$: Observable<boolean>;
  private initializingSubject = new Subject<boolean>();

  constructor(private httpSocketClient: HttpSocketClientService) {
    this.loadings$ = this.loadingSubject.asObservable().pipe(publishReplay(1), refCount());
    this.initializing$ = this.initializingSubject.asObservable().pipe(publishReplay(1), refCount());
    this.initializingLog$ = this.initializingLogSubject.asObservable().pipe(publishReplay(1), refCount());
    this.hasInitializingErrors$ = this.hasInitializingErrorsSubject.asObservable().pipe(publishReplay(1), refCount());
    this.loadings$.subscribe();
    this.initializing$.subscribe();
    this.initializingLog$.subscribe();
    this.hasInitializingErrors$.subscribe();
  }

  isLoading(): Observable<boolean> {
    return this.loadings$;
  }

  load() {
    this.loadings += 1;
    this._update();
  }

  unload() {
    if (this.loadings > 0) {
      this.loadings -= 1;
    }
    this._update();
  }

  initialize() {
    this.initializingSubject.next(true);
    this.hasInitializingErrorsSubject.next(false);
    this.initializingLogSubject.next('Loading...');
    this.httpSocketClient.getSocket().pipe(
      tap(
        x => {
          if (x.method === 'Connected') {
            this.initializingSubject.next(false);
          }
        }
      ),
      retryWhen(
        errors => concat(errors.pipe(delay(500), take(20)), throwError('Connection to backend server failed!'))
      ),
    ).subscribe(
      () => {},
      error => {
        this.hasInitializingErrorsSubject.next(true);
        this.initializingLogSubject.next(error);
      }
    );
  }

  private _update() {
    if (this.loadings > 0) {
      this.loadingSubject.next(true);
    } else {
      this.loadingSubject.next(false);
    }
  }

}
