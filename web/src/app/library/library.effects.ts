import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Title} from '@angular/platform-browser';
import {Action, Store} from '@ngrx/store';
import {Actions, Effect, ofType} from '@ngrx/effects';

import {CoreUtils} from '@app/core/core.utils';
import {HttpSocketClientService, SocketMessage} from '@app/core/services/http-socket-client.service';
import {AudioService} from '@app/core/services/audio.service';
import {Album, Artist, Track} from '@app/model';

import {LibraryUtils} from './library.utils';
import {LoadTrackFailure, LoadTrackSuccess, TracksActionTypes} from './actions/tracks.actions';
import {ArtistsActionTypes, LoadArtists} from './actions/artists.actions';
import {DeselectAlbum, DeselectAllAlbums, LoadAlbums} from './actions/albums.actions';
import {PlayNextTrackInPlaylist} from './actions/player.actions';
import * as fromLibrary from './library.reducers';

import {from, Observable, of} from 'rxjs';
import {catchError, filter, map, mergeMap, scan, switchMap, take, tap, finalize} from 'rxjs/operators';
import {LoaderService} from '@app/core/services/loader.service';

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
          map((tracks: Track[]) => tracks.map(LibraryUtils.fixTags)),
          map(tracks => new LoadTrackSuccess(tracks)),
          catchError((error: HttpErrorResponse) => of(new LoadTrackFailure(error.error)))
        )
      ),
    );

  // TODO move the two following effects to reducer
  /**
   * Extract Artists from loaded Tracks
   */
  @Effect()
  extractArtists$: Observable<Action> =
    this.actions$.pipe(
      ofType<LoadTrackSuccess>(TracksActionTypes.LoadTracksSuccess),
      map(action => action.payload),
      map((tracks: Track[]) =>
        new LoadArtists(LibraryUtils.extractArtists(tracks))
      ),
    );

  /**
   * Extract Albums from loaded Tracks
   */
  @Effect()
  extractAlbums$: Observable<Action> =
    this.actions$.pipe(
      ofType<LoadTrackSuccess>(TracksActionTypes.LoadTracksSuccess),
      map(action => action.payload),
      map((tracks: Track[]) =>
        new LoadAlbums(LibraryUtils.extractAlbums(tracks))
      ),
    );

  /**
   * Deselect Albums when Artists selection changes
   */
  @Effect()
  deselectAlbums$: Observable<Action> =
    this.actions$.pipe(
      ofType(
        ArtistsActionTypes.SelectArtists,
        ArtistsActionTypes.SelectArtistsByIds,
        ArtistsActionTypes.DeselectArtist,
      ),
      mergeMap(() =>
        this.store.select(fromLibrary.getSelectedArtists).pipe(take(1))
      ),
      map((artists: Artist[]) => artists.map(a => a.name)),
      mergeMap((artistsNames: string[]) =>
        this.store.select(fromLibrary.getSelectedAlbums).pipe(
          take(1),
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

  /**
   * Scan tracks (WebSocket)
   */
  @Effect()
  scanTracks$: Observable<Action> =
    this.actions$.pipe(
      ofType(TracksActionTypes.ScanTracks),
      tap(() => this.loader.load()),
      switchMap(() =>
        this.scanTracks().pipe(
          map(tracks => new LoadTrackSuccess(tracks)),
          finalize(() => this.loader.unload())
        )
      )
    );

  /**
   * Play Track
   */
  @Effect({dispatch: false})
  playTrack$: Observable<Track> =
    this.store.select(fromLibrary.getCurrentTrack).pipe(
      filter(track => !!track),
      tap(track => this.audioService.play(CoreUtils.resolveUrl(track.url))),
      tap(track => this.titleService.setTitle(`Musicalypse • ${track.metadata.artist} - ${track.metadata.title}`))
    );

  /**
   * Play next track when a song has ended
   */
  @Effect()
  playNextTrack$: Observable<Action> =
    this.audioService.ended$.pipe(
      map(() => new PlayNextTrackInPlaylist())
    );

  constructor(
    private actions$: Actions,
    private httpSocketClient: HttpSocketClientService,
    private store: Store<fromLibrary.State>,
    private titleService: Title,
    private audioService: AudioService,
    private loader: LoaderService
  ) {}

  public scanTracks(): Observable<Track[]> {
    return this._scanTracksObs().pipe(scan((acc: Track[], track: Track) => [LibraryUtils.fixTags(track), ...acc], []));
  }

  public _scanTracksObs(): Observable<Track> {
    return Observable.create((observer) => {
      const currentId = ++this.httpSocketClient.id;
      const subscription1 = this.httpSocketClient
        .getSocket()
        .pipe(
          filter((r: SocketMessage) => r.method === 'TrackAdded' && r.id === currentId),
          map((r: SocketMessage) => r.entity),
          map((e: Track) => e)
        )
        .subscribe(
          next => observer.next(next),
          error => observer.error(error)
        );
      const subscription2 = this.httpSocketClient
        .getSocket()
        .pipe(
          filter((r: SocketMessage) => (r.method === 'LibraryScanned' || r.method === 'LibraryScannedFailed') && r.id === currentId),
          take(1)
        )
        .subscribe((n: SocketMessage) => {
          if (n.method === 'LibraryScanned') {
            observer.complete();
          } else {
            observer.error(n.entity);
          }
        });
      this.httpSocketClient.send({method: 'ScanLibrary', id: currentId, entity: null});
      return () => {
        subscription1.unsubscribe();
        subscription2.unsubscribe();
      };
    });
  }

}
