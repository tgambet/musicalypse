import {Injectable} from '@angular/core';
import {concat, Observable, Subject, throwError} from 'rxjs';
import {delay, publishReplay, refCount, retryWhen, take} from 'rxjs/operators';
import {HttpSocketClientService} from '@app/core/services/http-socket-client.service';

@Injectable()
export class LoaderService {

  private loadings = 0;
  private readonly loadings$: Observable<boolean>;
  private loading = new Subject<boolean>();

  hasErrors$: Observable<boolean>;
  private hasErrors = new Subject<boolean>();

  log$: Observable<string>;
  private log = new Subject<string>();

  initializing$: Observable<boolean>;
  private initializing = new Subject<boolean>();

  constructor(
    private httpSocketClient: HttpSocketClientService
  ) {
    this.loadings$ = this.loading.asObservable().pipe(publishReplay(1), refCount());
    this.initializing$ = this.initializing.asObservable().pipe(publishReplay(1), refCount());
    this.log$ = this.log.asObservable().pipe(publishReplay(1), refCount());
    this.hasErrors$ = this.hasErrors.asObservable().pipe(publishReplay(1), refCount());
    this.loadings$.subscribe();
    this.initializing$.subscribe();
    this.log$.subscribe();
    this.hasErrors$.subscribe();
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
    this.initializing.next(true);
    this.hasErrors.next(false);
    this.log.next('Loading...');
    this.httpSocketClient.getSocket().pipe(
      retryWhen(
        errors => concat(errors.pipe(delay(500), take(10)), throwError('Connection to backend server failed!'))
      ),
      take(1)
    ).subscribe(
      () => {
        this.initializing.next(false);
      },
      error => {
        this.hasErrors.next(true);
        this.log.next(error);
      }
    );
  }

  private _update() {
    if (this.loadings > 0) {
      this.loading.next(true);
    } else {
      this.loading.next(false);
    }
  }

}
