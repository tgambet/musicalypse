import {Injectable} from '@angular/core';
import {concat, EMPTY, Observable, Subject, throwError} from 'rxjs';
import {catchError, delay, mergeMap, publishReplay, refCount, retryWhen, share, switchMap, take} from 'rxjs/operators';
import {HttpSocketClientService, SocketMessage} from '@app/core/services/http-socket-client.service';
import {MatSnackBar} from '@angular/material';

@Injectable()
export class LoaderService {

  private readonly loadings$: Observable<number>;
  private loading = new Subject<number>();

  hasErrors$: Observable<boolean>;
  private hasErrors = new Subject<boolean>();

  log$: Observable<string>;
  private log = new Subject<string>();

  initializing$: Observable<boolean>;
  private initializing = new Subject<boolean>();

  private socketObs$: Observable<SocketMessage>;

  constructor(
    private httpSocketClient: HttpSocketClientService,
    private snack: MatSnackBar
  ) {
    this.loadings$ = this.loading.asObservable().pipe(publishReplay(1), refCount());
    this.initializing$ = this.initializing.asObservable().pipe(publishReplay(1), refCount());
    // this.initializing$ = this.httpSocketClient.socketOpened$.pipe(map(opened => !opened), publishReplay(1), refCount())
    this.log$ = this.log.asObservable().pipe(publishReplay(1), refCount());
    this.hasErrors$ = this.hasErrors.asObservable().pipe(publishReplay(1), refCount());
    this.loadings$.subscribe();
    this.initializing$.subscribe();
    this.log$.subscribe();
    this.hasErrors$.subscribe();
  }

  /* errors => errors.pipe(
      switchMap(() => {
        if (window.navigator.onLine) {
          console.warn(`WebSocket failed. Retrying in 500ms.`);
          return timer(500);
        } else {
          return fromEvent(window, 'online').pipe(take(1));
        }
      }),
    ))*/

  getSharedSocket(): Observable<SocketMessage> {
    if (!this.socketObs$) {
      return this.socketObs$ =
        this.initializing$.pipe(
          switchMap(initializing => {
            if (initializing) {
              return EMPTY;
            } else {
              return this.httpSocketClient.getSocket().pipe(
                retryWhen(errors =>
                  concat(errors.pipe(delay(500), take(6)), throwError('Connection to server lost!'))
                ),
                catchError((error, caught) =>
                  this.snack.open(error, 'Retry')
                    .afterDismissed()
                    .pipe(mergeMap(() => caught))
                )
              );
            }
          }),
          share()
        );
    } else {
      return this.socketObs$;
    }
  }

  getLoading(): Observable<number> {
    return this.loadings$;
  }

  load(value: number) {
    this.loading.next(value);
  }

  unload() {
    this.loading.next(0);
  }

  initialize() {
    this.initializing.next(true);
    this.hasErrors.next(false);
    this.log.next('Loading...');
    this.httpSocketClient.getSocket().pipe(
      retryWhen(
        errors => concat(errors.pipe(delay(500), take(20)), throwError('Connection to server failed!'))
      ),
      take(1)
    ).subscribe(
      () => {},
      error => {
        this.hasErrors.next(true);
        this.log.next(error);
      },
      () => this.initializing.next(false)
    );
  }

}
