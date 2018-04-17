import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap, switchMap} from 'rxjs/operators';
import {Action} from '@ngrx/store';
import {
  AddLibraryFolder,
  AddLibraryFolderFailure,
  AddLibraryFolderSuccess,
  LoadLibraryFoldersFailure,
  LoadLibraryFoldersSuccess,
  RemoveLibraryFolder,
  RemoveLibraryFolderFailure,
  RemoveLibraryFolderSuccess,
  SettingsActionTypes
} from '@app/settings/settings.actions';
import {HttpSocketClientService} from '@app/core/services/http-socket-client.service';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable()
export class SettingsEffects {

  @Effect()
  loadLibraryFolders$: Observable<Action> =
    this.actions$.pipe(
      ofType(SettingsActionTypes.LoadLibraryFolders),
      switchMap(() =>
        this.httpSocketClient.get('/api/libraries').pipe(
          map((folders: string[]) => new LoadLibraryFoldersSuccess(folders)),
          catchError((error: HttpErrorResponse) => of(new LoadLibraryFoldersFailure(error.error)))
        )
      ),
    );

  @Effect()
  addLibraryFolder$: Observable<Action> =
    this.actions$.pipe(
      ofType<AddLibraryFolder>(SettingsActionTypes.AddLibraryFolder),
      map(action => action.payload),
      mergeMap(folder =>
        this.httpSocketClient.post('/api/libraries', folder).pipe(
          map(() => new AddLibraryFolderSuccess(folder)),
          catchError((error: HttpErrorResponse) => of(new AddLibraryFolderFailure(error.error)))
        )
      ),
    );

  @Effect()
  removeLibraryFolder$: Observable<Action> =
    this.actions$.pipe(
      ofType<RemoveLibraryFolder>(SettingsActionTypes.RemoveLibraryFolder),
      map(action => action.payload),
      mergeMap(folder =>
        this.httpSocketClient._delete('/api/libraries/' + encodeURIComponent(folder)).pipe(
          map(() => new RemoveLibraryFolderSuccess(folder)),
          catchError((error: HttpErrorResponse) => of(new RemoveLibraryFolderFailure(error.error)))
        )
      ),
    );

  constructor(
    private actions$: Actions,
    private httpSocketClient: HttpSocketClientService
  ) {}

}
