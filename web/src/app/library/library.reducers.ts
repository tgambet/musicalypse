import {ActionReducerMap, createFeatureSelector, createSelector} from '@ngrx/store';

import * as fromRoot from '@app/app.reducers';
import * as fromTracks from './reducers/tracks.reducers';
import * as fromArtists from './reducers/artists.reducers';
import * as fromAlbums from './reducers/albums.reducers';
import {Album, Artist} from '@app/model';
import {getAlbumId} from '@app/library/reducers/albums.reducers';

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
  getAllArtists,
  getSelectedArtistsIds,
  (artists, ids) => artists.filter(artist => ids.indexOf(artist.name) > -1)
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

export const getSelectedAlbumsIds = createSelector(
  getAlbumsState,
  fromAlbums.getSelectedIds
);

export const getSelectedAlbums = createSelector(
  getAllAlbums,
  getSelectedAlbumsIds,
  (albums, ids) => albums.filter(album => ids.indexOf(getAlbumId(album)) > -1)
);

export const isSelectedAlbum = (album: Album) => createSelector(
  getSelectedAlbumsIds,
  ids => ids.indexOf(getAlbumId(album)) > -1
);

export const getDisplayedAlbums = createSelector(
  getSelectedArtistsIds,
  getAllAlbums,
  (artistsIds, albums) =>
    albums.filter(album => artistsIds.indexOf(album.artist) > -1)
);

export const getDisplayedTracks = createSelector(
  getSelectedAlbumsIds,
  getAllTracks,
  (ids, tracks) =>
    tracks.filter(track => ids.indexOf(track.metadata.albumArtist + '-' + track.metadata.album) > -1)
);
