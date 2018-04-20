import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {Album} from '@app/model';
import {AlbumsActionsUnion, AlbumsActionTypes} from '@app/library/actions/albums.actions';

/**
 * State
 */
export interface State extends EntityState<Album> {
  selectedAlbumsIds: (string | number)[];
}

export const adapter: EntityAdapter<Album> = createEntityAdapter<Album>({
  selectId: (album: Album) => album.artist + '-' + album.title,
  sortComparer: (a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
});

export const initialState: State = adapter.getInitialState({
  selectedAlbumsIds: []
});

/**
 * Reducer
 */
export function reducer(
  state = initialState,
  action: AlbumsActionsUnion
): State {
  switch (action.type) {

    case AlbumsActionTypes.LoadAlbums:
      return adapter.addMany(action.payload, state);

    case AlbumsActionTypes.SelectAllAlbums: {
      return {
        ...state,
        selectedAlbumsIds: state.ids
      };
    }

    case AlbumsActionTypes.SelectAlbums: {
      return {
        ...state,
        selectedAlbumsIds: [...state.selectedAlbumsIds, ...action.payload.map(a => a.artist + '-' + a.title)]
      };
    }

    default: {
      return state;
    }
  }
}

/**
 * Selectors
 */
export const getSelectedAlbumsIds = (state: State) => state.selectedAlbumsIds;
