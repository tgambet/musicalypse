import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';

import {CoreUtils} from '@app/core/core.utils';
import {LoadTracks} from '../actions/tracks.actions';
import {SelectArtistsByIds} from '../actions/artists.actions';
import {SelectAlbumsByIds} from '../actions/albums.actions';
import * as fromLibrary from '../library.reducers';
import * as fromRoot from 'app/core/core.reducers';

import {map} from 'rxjs/operators';
import {SetPlaylist} from '@app/library/actions/player.actions';

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

}
