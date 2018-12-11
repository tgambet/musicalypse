import {Set} from 'immutable';
import {ImmutableTrack, toImmutable, Track} from '@app/model';
import {FavoritesActionsUnion, FavoritesActionTypes} from '../actions/favorites.actions';

export interface State {
  favorites: Set<ImmutableTrack>;
}

export const initialState: State = {
  favorites: Set()
};

export function reducer(
  state = initialState,
  action: FavoritesActionsUnion
): State {
  switch (action.type) {

    case FavoritesActionTypes.AddToFavorites: {
      const tracksToAdd = action.payload.map(toImmutable);
      return {
        ...state,
        favorites: state.favorites.concat(tracksToAdd)
      };
    }

    case FavoritesActionTypes.RemoveFromFavorites: {
      const track = toImmutable(action.payload);
      return {
        ...state,
        favorites: state.favorites.contains(track) ? state.favorites.delete(track) : state.favorites
      };
    }

    default:
      return state;
  }
}

export const getFavorites = (state: State) => state.favorites.toJS() as Track[];
export const isFavorite = (state: State, track: Track) => state.favorites.contains(toImmutable(track));


