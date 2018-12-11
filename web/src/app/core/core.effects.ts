import {Injectable} from '@angular/core';
import {OverlayContainer} from '@angular/cdk/overlay';
import {MatDialog} from '@angular/material';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Actions, Effect, ofType} from '@ngrx/effects';

import {Observable} from 'rxjs';
import {filter, map, tap} from 'rxjs/operators';

import {ChangeTheme, CoreActionTypes} from './core.actions';
import {LoaderService} from './services/loader.service';

import {ConfirmComponent} from '@app/shared/dialogs/confirm.component';
import * as fromRoot from '@app/app.reducers';
// TODO dependency on library!
import {ScanTracks} from '@app/library/actions/tracks.actions';

@Injectable()
export class CoreEffects {

  // Change Theme
  @Effect({ dispatch: false })
  themes$: Observable<void> =
    this.actions$.pipe(
      ofType<ChangeTheme>(CoreActionTypes.ChangeTheme),
      tap((action: ChangeTheme) => {
        const initialClass = this.overlayContainer.getContainerElement().className;
        this.overlayContainer.getContainerElement().className = initialClass + ' ' + action.payload.cssClass;
      }),
      map(() => {})
    );

  // First Notification
  @Effect({ dispatch: false })
  notify$ =
    this.loader.getSharedSocket().pipe(
      filter(next => (next.method === 'Notify') && next.id === 0),
      tap(next => {
        if (next.entity === 'First_Launch') {
          const title = 'Thank you for using Musicalypse!';
          const message = 'It looks like this is your first launch of Musicalypse.<br> ' +
            'Before you can listen to your music you need to go to Settings and scan your library.<br> ' +
            'By default Musicalypse will use the "Music" folder in your user home if it exists.<br> ' +
            'Do you want to scan it now?';
          this.dialog.open(ConfirmComponent, {data: {title: title, message: message}})
            .afterClosed()
            .subscribe(
              ok => {
                if (ok) {
                  this.store.dispatch(new ScanTracks());
                } else {
                  this.router.navigate(['/settings']);
                }
              }
            );
        }
      })
    );

  constructor(
    private actions$: Actions,
    private overlayContainer: OverlayContainer,
    private loader: LoaderService,
    private dialog: MatDialog,
    private store: Store<fromRoot.State>,
    private router: Router
  ) {}

}
