import {List} from 'immutable';
import {Track} from '@app/model';
import {FavoritesActionsUnion, FavoritesActionTypes} from '../actions/favorites.actions';
import * as _ from 'lodash';

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
        favorites: state.favorites.push(...action.payload)
      };
    }

    case FavoritesActionTypes.RemoveFromFavorites: {
      const index = state.favorites.findIndex(f => _.isEqual(f, action.payload));
      return {
        ...state,
        favorites: index > -1 ? state.favorites.delete(index) : state.favorites
      };
    }

    default:
      return state;
  }
}

export const getFavorites = (state: State) => state.favorites;


