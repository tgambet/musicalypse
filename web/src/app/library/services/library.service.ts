import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material';
import * as _ from 'lodash';

import {Album, Artist, Playlist, Track} from '@app/model';
import {CoreUtils} from '@app/core/core.utils';
import {AudioService} from '@app/core/services/audio.service';
import {LoaderService} from '@app/core/services/loader.service';
import {SetAudioMuted, SetAudioVolume} from '@app/core/core.actions';

import {AddToPlaylist, DeletePlaylist, LoadPlaylist, LoadPlaylists, RemoveFromPlaylist, SavePlaylist} from '../actions/playlists.actions';
import {DeselectAllArtists, DeselectArtist, SelectArtist, SelectArtists, SelectArtistsByIds} from '../actions/artists.actions';
import {DeselectAlbum, DeselectAllAlbums, SelectAlbum, SelectAlbums, SelectAlbumsByIds} from '../actions/albums.actions';
import {
  AddToCurrentPlaylist,
  PlayTrackNext,
  SetCurrentPlaylist,
  SetCurrentTrack,
  SetNextTrack,
  SetPreviousTrack,
  SetRepeat,
  SetShuffle
} from '../actions/player.actions';
import {AddToFavorites, RemoveFromFavorites} from '../actions/favorites.actions';
import {AddToRecent} from '../actions/recent.actions';
import {LoadTracks} from '../actions/tracks.actions';

import * as fromCore from '@app/app.reducers';
import * as fromLibrary from '../library.reducers';

@Injectable()
export class LibraryService {

  constructor(
    private store: Store<fromLibrary.State>,
    private loader: LoaderService,
    private audioService: AudioService,
    private snack: MatSnackBar
  ) {
    // Load Tracks
    loader.initializing$.subscribe(initializing => {
        if (!initializing) {
          store.dispatch(new LoadTracks());
        }
      }
    );

    this.store.select(fromLibrary.getTracksError)
      .pipe(filter(error => !!error))
      .subscribe(error =>
        this.snack.open('Error retrieving tracks! ' + error, 'Retry').afterDismissed().subscribe(
          () => store.dispatch(new LoadTracks())
        )
      );

    this.audioService.ended$.subscribe(() => this.playNextTrack());

    setTimeout(() => this.initialize(), 0);
  }

  initialize() {
    // TODO refactor
    // Restore selection state, playlist, favorites and recent tracks
    const savedSelectedArtistsIds = CoreUtils.load('selectedArtistsIds');
    if (savedSelectedArtistsIds) {
      this.store.dispatch(new SelectArtistsByIds(JSON.parse(savedSelectedArtistsIds)));
    }
    const savedSelectedAlbumsIds = CoreUtils.load('selectedAlbumsIds');
    if (savedSelectedAlbumsIds) {
      this.store.dispatch(new SelectAlbumsByIds(JSON.parse(savedSelectedAlbumsIds)));
    }
    const savedPlaylist = CoreUtils.load('playlist');
    if (savedPlaylist) {
      this.store.dispatch(new SetCurrentPlaylist(JSON.parse(savedPlaylist)));
    }
    const savedFavorites = CoreUtils.load('favorites');
    if (savedFavorites) {
      this.store.dispatch(new AddToFavorites(JSON.parse(savedFavorites)));
    }
    const savedRecent = CoreUtils.load('recent');
    if (savedRecent) {
      this.store.dispatch(new AddToRecent(JSON.parse(savedRecent)));
    }
    const savedPlaylists = CoreUtils.load('playlists');
    if (savedPlaylists) {
      this.store.dispatch(new LoadPlaylists(JSON.parse(savedPlaylists)));
    }
    const savedCurrent = CoreUtils.load('current');
    if (savedCurrent) {
      this.store.dispatch(new SetCurrentTrack(JSON.parse(savedCurrent)));
    }

    // Save selection state, playlist, favorites, and recent tracks on change
    this.store.select(fromLibrary.getSelectedArtistsIds).subscribe(
      ids => CoreUtils.save('selectedArtistsIds', JSON.stringify(ids))
    );
    this.store.select(fromLibrary.getSelectedAlbumsIds).subscribe(
      ids => CoreUtils.save('selectedAlbumsIds', JSON.stringify(ids))
    );
    this.getPlaylist().subscribe(
      playlist => CoreUtils.save('playlist', JSON.stringify(playlist))
    );
    this.getFavorites().subscribe(
      favs => CoreUtils.save('favorites', JSON.stringify(favs))
    );
    this.getRecentTracks().subscribe(
      tracks => CoreUtils.save('recent', JSON.stringify(tracks))
    );
    this.getPlaylists().subscribe(
      playlists => CoreUtils.save('playlists', JSON.stringify(playlists))
    );
    this.getCurrentTrack().subscribe(
      track => {
        if (track) { CoreUtils.save('current', JSON.stringify(track)); }
      }
    );
  }

  getAllArtists(): Observable<Artist[]> {
    return this.store.select(fromLibrary.getAllArtists);
  }

  getSelectedArtists() {
    return this.store.select(fromLibrary.getSelectedArtists);
  }

  getAllAlbums() {
    return this.store.select(fromLibrary.getAllAlbums);
  }

  getDisplayedAlbums() {
    return this.store.select(fromLibrary.getDisplayedAlbums);
  }

  getSelectedAlbums() {
    return this.store.select(fromLibrary.getSelectedAlbums);
  }

  getAllTracks(): Observable<Track[]> {
    return this.store.select(fromLibrary.getAllTracks);
  }

  getDisplayedTracks(): Observable<Track[]> {
    return this.store.select(fromLibrary.getDisplayedTracks);
  }

  getCurrentTrack(): Observable<Track> {
    return this.store.select(fromLibrary.getCurrentTrack);
  }

  getShuffle() {
    return this.store.select(fromLibrary.getShuffle);
  }

  getRepeat() {
    return this.store.select(fromLibrary.getRepeat);
  }

  getAudioMuted() {
    return this.store.select(fromCore.getAudioMuted);
  }

  getAudioVolume() {
    return this.store.select(fromCore.getAudioVolume);
  }

  getAudioPlaying() {
    return this.store.select(fromCore.getAudioPlaying);
  }

  getAudioLoading() {
    return this.store.select(fromCore.getAudioLoading);
  }

  getAudioDuration() {
    return this.store.select(fromCore.getAudioDuration);
  }

  getAudioCurrentTime() {
    return this.audioService.currentTime$; // TODO
  }

  getPlaylist(): Observable<Track[]> {
    return this.store.select(fromLibrary.getCurrentPlaylist);
  }

  selectArtists(artists: Artist[]) {
    this.store.dispatch(new SelectArtists(artists));
  }

  selectArtist(artist: Artist) {
    this.store.dispatch(new SelectArtist(artist));
  }

  deselectArtist(artist: Artist) {
    this.store.dispatch(new DeselectArtist(artist));
  }

  deselectAllArtists() {
    this.store.dispatch(new DeselectAllArtists());
  }

  isSelectedArtist(artist: Artist): Observable<boolean> {
    return this.store.select(fromLibrary.isSelectedArtist(artist));
  }

  selectAlbums(albums: Album[]) {
    this.store.dispatch(new SelectAlbums(albums));
  }

  selectAlbum(album: Album) {
    this.store.dispatch(new SelectAlbum(album));
  }

  deselectAlbum(album: Album) {
    this.store.dispatch(new DeselectAlbum(album));
  }

  deselectAllAlbums() {
    this.store.dispatch(new DeselectAllAlbums());
  }

  isSelectedAlbum(album: Album): Observable<boolean> {
    return this.store.select(fromLibrary.isSelectedAlbum(album));
  }

  setTrack(track: Track) {
    this.store.dispatch(new SetCurrentTrack(track));
  }

  playTrack(track: Track) {
    this.setTrack(track);
    this.play();
  }

  play() {
    this.audioService.play(); // TODO catch errors
  }

  pause() {
    this.audioService.pause();
  }

  seekTo(time: number) {
    this.audioService.seekTo(time);
  }

  playTrackNext(track: Track): void {
    this.store.dispatch(new PlayTrackNext(track));
  }

  setPlaylist(playlist: Track[]) {
    this.store.dispatch(new SetCurrentPlaylist(playlist));
  }

  addToCurrentPlaylist(tracks: Track[]) {
    /*this.store.select(fromLibrary.getCurrentPlaylist).pipe(
      take(1),
      map(playlist => {
        playlist.push(...tracks.filter(track => !playlist.some(t => _.isEqual(t, track))));
        this.store.dispatch(new SetCurrentPlaylist(playlist));
      })
    ).subscribe();*/
    this.store.dispatch(new AddToCurrentPlaylist(tracks));
  }

  clearPlaylist() {
    this.store.dispatch(new SetCurrentPlaylist([]));
  }

  playPreviousTrack() {
    this.store.dispatch(new SetPreviousTrack());
    this.play();
  }

  playNextTrack() {
    this.store.dispatch(new SetNextTrack());
    this.play();
  }

  setShuffle(value: boolean) {
    this.store.dispatch(new SetShuffle(value));
  }

  setRepeat(value: boolean) {
    this.store.dispatch(new SetRepeat(value));
  }

  setMuted(value: boolean) {
    this.store.dispatch(new SetAudioMuted(value));
  }

  setVolume(value: number) {
    this.store.dispatch(new SetAudioVolume(value));
  }

  selectInLibrary(playlist: Track[]) {
    const artistsIds = _.uniq(playlist.map(track => track.metadata.albumArtist));
    const albumsIds = _.uniq(playlist.map(track => track.metadata.albumArtist + '-' + track.metadata.album));
    this.store.dispatch(new SelectArtistsByIds(artistsIds));
    this.store.dispatch(new SelectAlbumsByIds(albumsIds));
  }

  addToFavorites(track: Track) {
    this.store.dispatch(new AddToFavorites([track]));
  }

  removeFromFavorites(track: Track) {
    this.store.dispatch(new RemoveFromFavorites(track));
  }

  isFavorite(track: Track): Observable<boolean> {
    return this.store.select(fromLibrary.isFavorite, track);
  }

  getFavorites(): Observable<Track[]> {
    return this.store.select(fromLibrary.getFavorites);
  }

  getDisplayedFavorites(): Observable<Track[]> {
    return this.store.select(fromLibrary.getDisplayedFavorites);
  }

  getFavoriteArtists(): Observable<Artist[]> {
    return this.store.select(fromLibrary.getFavoritesArtists);
  }

  getFavoriteAlbums(): Observable<Album[]> {
    return this.store.select(fromLibrary.getDisplayedFavoriteAlbums);
  }

  getRecentTracks(): Observable<Track[]> {
    return this.store.select(fromLibrary.getRecentTracks);
  }

  getDisplayedRecentTracks(): Observable<Track[]> {
    return this.store.select(fromLibrary.getDisplayedRecentTracks);
  }

  getRecentArtists(): Observable<Artist[]> {
    return this.store.select(fromLibrary.getRecentArtists);
  }

  getRecentAlbums(): Observable<Album[]> {
    return this.store.select(fromLibrary.getDisplayedRecentAlbums);
  }

  loadPlaylist(playlist: Playlist) {
    this.store.dispatch(new LoadPlaylist(playlist));
  }

  savePlaylist(name: string, tracks: Track[]) {
    this.store.dispatch(new SavePlaylist(name, tracks));
    this.snack.open('Playlist saved!', 'OK', {duration: 2000}); // TODO
  }

  deletePlaylist(name: string) {
    this.store.dispatch(new DeletePlaylist(name));
  }

  addToPlaylist(tracks: Track[], playlist: string) {
    this.store.dispatch(new AddToPlaylist(tracks, playlist));
  }

  removeFromPlaylist(track: Track, playlist: string) {
    this.store.dispatch(new RemoveFromPlaylist(track, playlist));
  }

  getPlaylists(): Observable<Playlist[]> {
    return this.store.select(fromLibrary.getPlaylists);
  }

  getTracksByArtist(artist: Artist): Observable<Track[]> {
    return this.store.select(fromLibrary.getTracksByArtist, artist);
  }

  getTracksByAlbumId(albumId: String): Observable<Track[]> {
    return this.store.select(fromLibrary.getTracksByAlbumId, albumId);
  }

}
