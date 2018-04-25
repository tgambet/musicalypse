import {List} from 'immutable';
import {Track} from '@app/model';
import {FavoritesActionsUnion, FavoritesActionTypes} from '../actions/favorites.actions';

export interface State {
  favorites: List<Track>;
}

export const initialState: State = {
  favorites: List()
};

export function reducer(
  state = initialState,
  action: FavoritesActionsUnion
): State {
  switch (action.type) {

    case FavoritesActionTypes.AddToFavorites: {
      return {
        ...state,
        favorites: state.favorites.push(action.payload)
      };
    }

    case FavoritesActionTypes.RemoveFromFavorites: {
      return {
        ...state,
        favorites: state.favorites.indexOf(action.payload) > -1 ?
          state.favorites.delete(state.favorites.indexOf(action.payload)) :
          state.favorites
      };
    }

    default:
      return state;
  }
}

export const getFavorites = (state: State) => state.favorites;


