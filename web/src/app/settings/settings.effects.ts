import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Action} from '@ngrx/store';
import {LoadLibraryFoldersFailure, LoadLibraryFoldersSuccess, SettingsActionTypes} from '@app/settings/settings.actions';
import {switchMap} from 'rxjs/internal/operators';
import {HttpSocketClientService} from '@app/core/services/http-socket-client.service';

@Injectable()
export class SettingsEffects {

  @Effect()
  loadLibraryFolders$: Observable<Action> =
    this.actions$.pipe(
      ofType(SettingsActionTypes.LoadLibraryFolders),
      switchMap(() =>
        this.httpSocketClient.get('/api/libraries').pipe(
          map((folders: string[]) => new LoadLibraryFoldersSuccess(folders)),
          catchError(error => of(new LoadLibraryFoldersFailure(error)))
        )
      ),
    );

  constructor(
    private actions$: Actions,
    private httpSocketClient: HttpSocketClientService
  ) {}

}
