import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable} from 'rxjs';
import {filter, map, tap} from 'rxjs/operators';
import {ChangeTheme, CoreActionTypes} from '@app/core/core.actions';
import {OverlayContainer} from '@angular/cdk/overlay';
import {CoreUtils} from '@app/core/core.utils';
import {LoaderService} from '@app/core/services/loader.service';
import {ScanTracks} from '@app/library/actions/tracks.actions';
import {ConfirmComponent} from '@app/shared/dialogs/confirm.component';
import {MatDialog} from '@angular/material';
import * as fromRoot from '@app/app.reducers';
import {Store} from '@ngrx/store';
import {Router} from '@angular/router';

@Injectable()
export class CoreEffects {

  @Effect({ dispatch: false })
  themes$: Observable<void> =
    this.actions$.pipe(
      ofType<ChangeTheme>(CoreActionTypes.ChangeTheme),
      tap((action: ChangeTheme) => {
        this.overlayContainer.getContainerElement().className = 'cdk-overlay-container ' + action.payload.cssClass;
        CoreUtils.save('theme', JSON.stringify(action.payload));
      }),
      map(() => {})
    );

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
