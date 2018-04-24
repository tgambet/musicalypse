import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';

import {CoreUtils} from '@app/core/core.utils';
import {LoadTracks} from '../actions/tracks.actions';
import {SelectArtistsByIds} from '../actions/artists.actions';
import {SelectAlbumsByIds} from '../actions/albums.actions';
import * as fromLibrary from '../library.reducers';
import * as fromRoot from 'app/core/core.reducers';

import {map} from 'rxjs/operators';
import {
  AddTracksToPlaylist,
  PlayNextTrackInPlaylist,
  PlayPreviousTrackInPlaylist,
  PlayTrack,
  PlayTrackNext, ResetPlaylist,
  SetPlaylist, SetRepeat, SetShuffle
} from '@app/library/actions/player.actions';
import {Album, Artist, Track} from '@app/model';
import {DeselectAlbum, DeselectAllAlbums, SelectAlbum, SelectAlbums, SelectAllAlbums} from '@app/library/actions/albums.actions';
import {Observable} from 'rxjs';
import {DeselectAllArtists, DeselectArtist, SelectAllArtists, SelectArtist, SelectArtists} from '@app/library/actions/artists.actions';

@Injectable()
export class LibraryService {

  constructor(private store: Store<fromRoot.State>) {
    // Load Tracks
    store.dispatch(new LoadTracks());

    // Restore selection state and playlist
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

    // Save selection state and playlist on change
    this.store.select(fromLibrary.getSelectedArtistsIds).subscribe(
      ids => CoreUtils.save('selectedArtistsIds', JSON.stringify(ids))
    );
    this.store.select(fromLibrary.getSelectedAlbumsIds).subscribe(
      ids => CoreUtils.save('selectedAlbumsIds', JSON.stringify(ids))
    );
    this.store.select(fromLibrary.getPlaylist).subscribe(
      playlist => CoreUtils.save('playlist', JSON.stringify(playlist))
    );
  }

  getArtists() {
    return this.store.select(fromLibrary.getAllArtists);
  }

  getSelectedArtists() {
    return this.store.select(fromLibrary.getSelectedArtists);
  }

  getAlbums() {
    return this.store.select(fromLibrary.getDisplayedAlbums);
  }

  getSelectedAlbums() {
    return this.store.select(fromLibrary.getSelectedAlbums);
  }

  getTracks() {
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
    return this.store.select(fromLibrary.getPlaylist).pipe(map(p => p.toArray()));
  }

  selectAllArtists() {
    this.store.dispatch(new SelectAllArtists());
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

  selectAllAlbums() {
    this.store.dispatch(new SelectAllAlbums());
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
    const artistsIds = playlist.map(track => track.metadata.albumArtist);
    const albumsIds = playlist.map(track => track.metadata.albumArtist + '-' + track.metadata.album);
    this.store.dispatch(new SelectArtistsByIds(artistsIds));
    this.store.dispatch(new SelectAlbumsByIds(albumsIds));
  }
}
