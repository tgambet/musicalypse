import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Action, Store} from '@ngrx/store';
import {Actions, Effect, ofType} from '@ngrx/effects';

import {HttpSocketClientService} from '@app/core/services/http-socket-client.service';
import {Album, Artist, Track} from '@app/model';

import {LoadTrackFailure, LoadTrackSuccess, TracksActionTypes} from './actions/tracks.actions';
import {ArtistsActionTypes, LoadArtists} from './actions/artists.actions';
import {AlbumsActionTypes, DeselectAlbum, DeselectAllAlbums, LoadAlbums, SelectAlbums} from './actions/albums.actions';
import {LibraryService} from './services/library.service';

import * as fromLibrary from './library.reducers';

import {from, Observable, of} from 'rxjs';
import {catchError, map, mergeMap, switchMap} from 'rxjs/operators';

@Injectable()
export class LibraryEffects {

  /**
   * Load tracks from the API
   */
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

  /**
   * Extract Artists from loaded Tracks
   */
  @Effect()
  loadArtists$: Observable<Action> =
    this.actions$.pipe(
      ofType<LoadTrackSuccess>(TracksActionTypes.LoadTracksSuccess),
      map(action => action.payload),
      map((tracks: Track[]) =>
        new LoadArtists(LibraryService.extractArtists(tracks))
      ),
    );

  /**
   * Extract Albums from loaded Tracks
   */
  @Effect()
  loadAlbums$: Observable<Action> =
    this.actions$.pipe(
      ofType<LoadTrackSuccess>(TracksActionTypes.LoadTracksSuccess),
      map(action => action.payload),
      map((tracks: Track[]) =>
        new LoadAlbums(LibraryService.extractAlbums(tracks))
      ),
    );

  /**
   * Select All *displayed* albums when SelectAllAlbums is called
   */
  @Effect()
  selectAllAlbums$: Observable<Action> =
    this.actions$.pipe(
      ofType(AlbumsActionTypes.SelectAllAlbums),
      switchMap(() =>
        this.store.select(fromLibrary.getDisplayedAlbums).take(1).pipe(
          map(albums => new SelectAlbums(albums))
        )
      )
    );

  /**
   * Deselect Albums when Artists selection changes
   */
  @Effect()
  deselectAlbums$: Observable<Action> =
    this.actions$.pipe(
      ofType(
        ArtistsActionTypes.SelectArtists,
        ArtistsActionTypes.DeselectArtist,
      ),
      mergeMap(() =>
        this.store.select(fromLibrary.getSelectedArtists).take(1)
      ),
      map((artists: Artist[]) => artists.map(a => a.name)),
      mergeMap((artistsNames: string[]) =>
        this.store.select(fromLibrary.getSelectedAlbums).take(1).pipe(
          mergeMap((albums: Album[]) =>
            from(
              albums
                .filter(album => artistsNames.indexOf(album.artist) === -1)
                .map(album => new DeselectAlbum(album))
            )
          )
        )
      )
    );

  /**
   * Deselect all Albums when Artists selection is emptied
   */
  @Effect()
  deselectAllAlbums$: Observable<Action> =
    this.actions$.pipe(
      ofType(ArtistsActionTypes.DeselectAllArtists),
      map(() => new DeselectAllAlbums())
    );

  constructor(
    private actions$: Actions,
    private httpSocketClient: HttpSocketClientService,
    private store: Store<fromLibrary.State>
  ) {}

}
