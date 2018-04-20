import {ActionReducerMap, createFeatureSelector, createSelector} from '@ngrx/store';

import * as fromRoot from '@app/reducers';
import * as fromTracks from './reducers/tracks.reducers';
import * as fromArtists from './reducers/artists.reducers';
import * as fromAlbums from './reducers/albums.reducers';
import {Artist} from '@app/model';

export interface LibraryState {
  tracks: fromTracks.State;
  artists: fromArtists.State;
  albums: fromAlbums.State;
}

export interface State extends fromRoot.State {
  library: LibraryState;
}

export const reducers: ActionReducerMap<LibraryState> = {
  tracks: fromTracks.reducer,
  artists: fromArtists.reducer,
  albums: fromAlbums.reducer
};

export const getLibraryState = createFeatureSelector<LibraryState>('library');

export const getTracksState = createSelector(
  getLibraryState,
  state => state.tracks
);

export const getTracksError = createSelector(
  getTracksState,
  fromTracks.getError
);

export const {
  selectIds: getTrackIds,
  selectEntities: getTrackEntities,
  selectAll: getAllTracks,
  selectTotal: getTotalTracks,
} = fromTracks.adapter.getSelectors(getTracksState);

export const getArtistsState = createSelector(
  getLibraryState,
  state => state.artists
);

export const {
  selectIds: getArtistIds,
  selectEntities: getArtistEntities,
  selectAll: getAllArtists,
  selectTotal: getTotalArtists,
} = fromArtists.adapter.getSelectors(getArtistsState);

export const getSelectedArtistsIds = createSelector(
  getArtistsState,
  fromArtists.getSelectedIds
);

export const getSelectedArtists = createSelector(
  getArtistEntities,
  getSelectedArtistsIds,
  (entities, ids) => {
    const result: Artist[] = [];
    ids.forEach(id => result.push(entities[id]));
    return result;
  }
);

export const isSelectedArtist = (artist: Artist) => createSelector(
  getSelectedArtistsIds,
  ids => ids.indexOf(artist.name) > -1
);

export const getAlbumsState = createSelector(
  getLibraryState,
  state => state.albums
);

export const {
  selectIds: getAlbumIds,
  selectEntities: getAlbumEntities,
  selectAll: getAllAlbums,
  selectTotal: getTotalAlbums,
} = fromAlbums.adapter.getSelectors(getAlbumsState);
