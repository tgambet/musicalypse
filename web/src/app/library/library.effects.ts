import {Injectable} from '@angular/core';
import {catchError, map, switchMap} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {Action} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {HttpSocketClientService} from '@app/core/services/http-socket-client.service';
import {LoadTrackFailure, LoadTrackSuccess, TracksActionTypes} from '@app/library/actions/tracks.actions';
import {Track} from '@app/model';
import {LibraryService} from '@app/library/services/library.service';

@Injectable()
export class LibraryEffects {

  @Effect()
  loadTracks$: Observable<Action> =
    this.actions$.pipe(
      ofType(TracksActionTypes.LoadTracks),
      switchMap(() =>
        this.httpSocketClient.get('/api/libraries/tracks').pipe(
          map((tracks: Track[]) => tracks.map(LibraryService.fixTags)),
          map(tracks => new LoadTrackSuccess(tracks)),
          catchError((error: HttpErrorResponse) => of(new LoadTrackFailure(error.error)))
        )
      ),
    );

  constructor(
    private actions$: Actions,
    private httpSocketClient: HttpSocketClientService
  ) {}

}
