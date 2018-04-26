import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {Album} from '@app/model';
import {AlbumsActionsUnion, AlbumsActionTypes} from '@app/library/actions/albums.actions';
import {TracksActionsUnion, TracksActionTypes} from '@app/library/actions/tracks.actions';
import {LibraryUtils} from '@app/library/library.utils';

export const getAlbumId = (album: Album) => album.artist + '-' + album.title;

/**
 * State
 */
export interface State extends EntityState<Album> {
  selectedIds: (string | number)[];
}

export const adapter: EntityAdapter<Album> = createEntityAdapter<Album>({
  selectId: getAlbumId,
  sortComparer: (a, b) => a.title.localeCompare(b.title),
});

export const initialState: State = adapter.getInitialState({
  selectedIds: []
});

/**
 * Reducer
 */
export function reducer(
  state = initialState,
  action: AlbumsActionsUnion | TracksActionsUnion
): State {
  switch (action.type) {

    case AlbumsActionTypes.LoadAlbums:
      return adapter.upsertMany(action.payload, state);

    case AlbumsActionTypes.DeselectAllAlbums: {
      return {
        ...state,
        selectedIds: []
      };
    }

    case AlbumsActionTypes.SelectAlbum: {
      if (state.selectedIds.indexOf(getAlbumId(action.payload)) === -1) {
        return {
          ...state,
          selectedIds: [...state.selectedIds, getAlbumId(action.payload)]
        };
      } else {
        return state;
      }
    }

    case AlbumsActionTypes.DeselectAlbum: {
      return {
        ...state,
        selectedIds: state.selectedIds.filter(id => id !== getAlbumId(action.payload))
      };
    }

    case AlbumsActionTypes.SelectAlbums: {
      return {
        ...state,
        selectedIds: action.payload.map(getAlbumId)
      };
    }

    case AlbumsActionTypes.SelectAlbumsByIds: {
      return {
        ...state,
        selectedIds: action.payload
      };
    }

    case TracksActionTypes.ScanTracks:
      return adapter.removeAll({
        ...state,
        selectedIds: []
      });

    case TracksActionTypes.LoadTracksSuccess: {
      const albums = LibraryUtils.extractAlbums(action.payload);
      return adapter.upsertMany(albums, state);
    }

    case TracksActionTypes.AddTrack: {
      const album = LibraryUtils.extractAlbums([action.payload])[0];
      const old = state.entities[getAlbumId(album)];
      if (old) {
        album.songs += old.songs;
      }
      return adapter.upsertOne(album, state);
    }

    default: {
      return state;
    }
  }
}

/**
 * Selectors
 */
export const getSelectedIds = (state: State) => state.selectedIds;
