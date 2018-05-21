import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import * as _ from 'lodash';

import {Album, Artist, Playlist, Track} from '@app/model';
import {CoreUtils} from '@app/core/core.utils';
import {LoaderService} from '@app/core/services/loader.service';

import {LoadTracks} from '../actions/tracks.actions';
import {DeselectAllArtists, DeselectArtist, SelectArtist, SelectArtists, SelectArtistsByIds} from '../actions/artists.actions';
import {DeselectAlbum, DeselectAllAlbums, SelectAlbum, SelectAlbums, SelectAlbumsByIds} from '../actions/albums.actions';
import {
  AddTracksToPlaylist,
  PlayNextTrackInPlaylist,
  PlayPreviousTrackInPlaylist,
  PlayTrack,
  PlayTrackNext,
  ResetPlaylist,
  SetPlaylist,
  SetRepeat,
  SetShuffle
} from '../actions/player.actions';
import {AddToFavorites, RemoveFromFavorites} from '../actions/favorites.actions';
import {AddToRecent} from '../actions/recent.actions';

import * as fromLibrary from '../library.reducers';
import {
  AddToPlaylist,
  DeletePlaylist,
  LoadPlaylist,
  LoadPlaylists,
  RemoveFromPlaylist,
  SavePlaylist
} from '@app/library/actions/playlists.actions';
import {AudioService} from '@app/core/services/audio.service';

@Injectable()
export class LibraryService {

  constructor(
    private store: Store<fromLibrary.State>,
    private loader: LoaderService,
    private audioService: AudioService
  ) {
    // Load Tracks
    loader.initializing$.subscribe(initializing => {
        if (!initializing) {
          store.dispatch(new LoadTracks());
        }
      }
    );

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
      this.store.dispatch(new SetPlaylist(JSON.parse(savedPlaylist)));
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
      this.store.dispatch(new PlayTrack(JSON.parse(savedCurrent)));
      this.audioService.pause();
    }

    // Save selection state, playlist, favorites, and recent tracks on change
    this.store.select(fromLibrary.getSelectedArtistsIds).subscribe(
      ids => CoreUtils.save('selectedArtistsIds', JSON.stringify(ids))
    );
    this.store.select(fromLibrary.getSelectedAlbumsIds).subscribe(
      ids => CoreUtils.save('selectedAlbumsIds', JSON.stringify(ids))
    );
    this.store.select(fromLibrary.getPlaylist).subscribe(
      playlist => CoreUtils.save('playlist', JSON.stringify(playlist))
    );
    this.store.select(fromLibrary.getFavorites).subscribe(
      favs => CoreUtils.save('favorites', JSON.stringify(favs))
    );
    this.store.select(fromLibrary.getRecentTracks).subscribe(
      tracks => CoreUtils.save('recent', JSON.stringify(tracks))
    );
    this.store.select(fromLibrary.getPlaylists).subscribe(
      playlists => CoreUtils.save('playlists', JSON.stringify(playlists))
    );
    this.store.select(fromLibrary.getCurrentTrack).subscribe(
      track => CoreUtils.save('current', JSON.stringify(track))
    );

    // Set up loader
    this.store.select(fromLibrary.getTracksLoading).subscribe(
      loading => loading ? this.loader.load() : this.loader.unload()
    );
  }

  getAllArtists() {
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

  getAllTracks() {
    return this.store.select(fromLibrary.getAllTracks);
  }

  getDisplayedTracks() {
    return this.store.select(fromLibrary.getDisplayedTracks);
  }

  getCurrentTrack() {
    return this.store.select(fromLibrary.getCurrentTrack);
  }

  getShuffle() {
    return this.store.select(fromLibrary.getShuffle);
  }

  getRepeat() {
    return this.store.select(fromLibrary.getRepeat);
  }

  getPlaylist() {
    return this.store.select(fromLibrary.getPlaylist);
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

  playTrack(track: Track) {
    this.store.dispatch(new PlayTrack(track));
  }

  playTrackNext(track: Track) {
    this.store.dispatch(new PlayTrackNext(track));
  }

  setPlaylist(playlist: Track[]) {
    this.store.dispatch(new SetPlaylist(playlist));
  }

  addTracksToPlaylist(tracks: Track[]) {
    this.store.dispatch(new AddTracksToPlaylist(tracks));
  }

  clearPlaylist() {
    this.store.dispatch(new ResetPlaylist());
  }

  playPreviousTrack() {
    this.store.dispatch(new PlayPreviousTrackInPlaylist());
  }

  playNextTrack() {
    this.store.dispatch(new PlayNextTrackInPlaylist());
  }

  setShuffle(value: boolean) {
    this.store.dispatch(new SetShuffle(value));
  }

  setRepeat(value: boolean) {
    this.store.dispatch(new SetRepeat(value));
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
    return this.store.select(fromLibrary.isFavorite(track));
  }

  getFavorites(): Observable<Track[]> {
    return this.store.select(fromLibrary.getDisplayedFavorites);
  }

  getFavoriteArtists(): Observable<Artist[]> {
    return this.store.select(fromLibrary.getFavoritesArtists);
  }

  getFavoriteAlbums(): Observable<Album[]> {
    return this.store.select(fromLibrary.getDisplayedFavoriteAlbums);
  }

  getRecentTracks(): Observable<Track[]> {
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

}
