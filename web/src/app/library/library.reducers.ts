import {ActionReducerMap, createFeatureSelector, createSelector} from '@ngrx/store';

import {Album, Artist, Track} from '@app/model';

import * as fromRoot from '@app/app.reducers';
import * as fromTracks from './reducers/tracks.reducers';
import * as fromArtists from './reducers/artists.reducers';
import * as fromAlbums from './reducers/albums.reducers';
import * as fromPlayer from './reducers/player.reducer';
import * as fromFavorites from './reducers/favorites.reducers';
import * as fromRecent from './reducers/recent.reducer';
import * as fromPlaylists from './reducers/playlists.reducers';
import * as fromLyrics from './reducers/lyrics.reducers';

export interface LibraryState {
  tracks: fromTracks.State;
  artists: fromArtists.State;
  albums: fromAlbums.State;
  player: fromPlayer.State;
  favorites: fromFavorites.State;
  recent: fromRecent.State;
  playlists: fromPlaylists.State;
  lyrics: fromLyrics.State;
}

export interface State extends fromRoot.State {
  library: LibraryState;
}

export const reducers: ActionReducerMap<LibraryState> = {
  tracks: fromTracks.reducer,
  artists: fromArtists.reducer,
  albums: fromAlbums.reducer,
  player: fromPlayer.reducer,
  favorites: fromFavorites.reducer,
  recent: fromRecent.reducer,
  playlists: fromPlaylists.reducer,
  lyrics: fromLyrics.reducer
};

export const getLibraryState = createFeatureSelector<LibraryState>('library');

/**
 * Tracks selectors
 */
export const getTracksState = createSelector(
  getLibraryState,
  state => state.tracks
);

export const getTracksError = createSelector(
  getTracksState,
  fromTracks.getError
);

export const getTracksLoading = createSelector(
  getTracksState,
  fromTracks.getLoading
);

export const {
  selectIds: getTrackIds,
  selectEntities: getTrackEntities,
  selectAll: getAllImmutableTracks,
  selectTotal: getTotalTracks,
} = fromTracks.adapter.getSelectors(getTracksState);

export const getAllTracks = createSelector(
  getAllImmutableTracks,
  tracks => tracks.map(t => t.toJS() as Track)
);

export const getTracksByArtist = createSelector(
  getAllTracks,
  (tracks: Track[], artist: Artist) => tracks.filter(track => track.albumArtist === artist.name)
);

export const getTracksByAlbumId = createSelector(
  getAllTracks,
  (tracks: Track[], albumId: string) => tracks.filter(track => track.albumArtist + '-' + track.album === albumId)
);

/**
 * Artists selectors
 */
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
  (artists, ids) => artists.filter(artist => ids.includes(artist.name))
);

export const isSelectedArtist = (artist: Artist) => createSelector(
  getSelectedArtistsIds,
  ids => ids.includes(artist.name)
);

/**
 * Albums selectors
 */
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
  (albums, ids) => albums.filter(album => ids.includes(fromAlbums.getAlbumId(album)))
);

export const isSelectedAlbum = (album: Album) => createSelector(
  getSelectedAlbumsIds,
  ids => ids.includes(fromAlbums.getAlbumId(album))
);

export const getDisplayedAlbums = createSelector(
  getSelectedArtistsIds,
  getAllAlbums,
  (artistsIds, albums) =>
    albums.filter(album => artistsIds.includes(album.artist))
);

export const getDisplayedTracks = createSelector(
  getSelectedAlbumsIds,
  getAllTracks,
  (ids, tracks) =>
    tracks.filter(track => ids.includes(track.albumArtist + '-' + track.album))
);

/**
 * Player selectors
 */
export const getPlayerState = createSelector(
  getLibraryState,
  state => state.player
);

export const getCurrentTrack = createSelector(
  getPlayerState,
  fromPlayer.getCurrentTrack
);

export const getRepeat = createSelector(
  getPlayerState,
  fromPlayer.getRepeat
);

export const getShuffle = createSelector(
  getPlayerState,
  fromPlayer.getShuffle
);

export const getCurrentPlaylist = createSelector(
  getPlayerState,
  fromPlayer.getCurrentPlaylist
);

/**
 * Favorites selectors
 */
export const getFavoritesState = createSelector(
  getLibraryState,
  state => state.favorites
);

export const getFavorites = createSelector(
  getFavoritesState,
  fromFavorites.getFavorites
);

export const isFavorite = createSelector(
  getFavoritesState,
  fromFavorites.isFavorite
);

export const getFavoritesArtists = createSelector(
  getAllArtists,
  getFavorites,
  (artists, favorites) => {
    const favArtists = favorites.map(fav => fav.albumArtist);
    return artists.filter(artist => favArtists.includes(artist.name));
  }
);

export const getFavoritesAlbums = createSelector(
  getAllAlbums,
  getFavorites,
  (albums, favorites) => {
    const favAlbums = favorites.map(fav => fav.album);
    return albums.filter(album => favAlbums.includes(album.title));
  }
);

export const getDisplayedFavorites = createSelector(
  getSelectedAlbumsIds,
  getFavorites,
  (ids, tracks) =>
    tracks.filter(track => ids.includes(track.albumArtist + '-' + track.album))
);

export const getDisplayedFavoriteAlbums = createSelector(
  getSelectedArtistsIds,
  getFavoritesAlbums,
  (artistsIds, albums) =>
    albums.filter(album => artistsIds.includes(album.artist))
);

/**
 * Recent tracks selectors
 */
export const getRecentState = createSelector(
  getLibraryState,
  state => state.recent
);

export const getRecentTracks = createSelector(
  getRecentState,
  fromRecent.getRecentTracks
);

export const getRecentArtists = createSelector(
  getAllArtists,
  getRecentTracks,
  (artists, recentTracks) => {
    const recentArtists = recentTracks.map(recent => recent.albumArtist);
    return artists.filter(artist => recentArtists.includes(artist.name));
  }
);

export const getRecentAlbums = createSelector(
  getAllAlbums,
  getRecentTracks,
  (albums, recentTracks) => {
    const recentAlbums = recentTracks.map(recent => recent.album);
    return albums.filter(album => recentAlbums.includes(album.title));
  }
);

export const getDisplayedRecentTracks = createSelector(
  getSelectedAlbumsIds,
  getRecentTracks,
  (ids, tracks) =>
    tracks.filter(track => ids.includes(track.albumArtist + '-' + track.album))
);

export const getDisplayedRecentAlbums = createSelector(
  getSelectedArtistsIds,
  getRecentAlbums,
  (artistsIds, albums) =>
    albums.filter(album => artistsIds.includes(album.artist))
);

/**
 * Playlists selectors
 */
export const getPlaylistsState = createSelector(
  getLibraryState,
  state => state.playlists
);

export const getPlaylists = createSelector(
  getPlaylistsState,
  fromPlaylists.getPlaylists
);

/**
 * Lyrics selectors
 */

export const getLyricsState = createSelector(
  getLibraryState,
  state => state.lyrics
);

export const getLyricsLoading = createSelector(
  getLyricsState,
  fromLyrics.getLoading
);
