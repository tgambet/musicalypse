import {Track} from '@app/model';
import {Action} from '@ngrx/store';

export enum FavoritesActionTypes {
  AddToFavorites      = 'library/favorites/add',
  RemoveFromFavorites = 'library/favorites/remove'
}

export class AddToFavorites implements Action {
  readonly type = FavoritesActionTypes.AddToFavorites;
  constructor(public payload: Track[]) {}
}

export class RemoveFromFavorites implements Action {
  readonly type = FavoritesActionTypes.RemoveFromFavorites;
  constructor(public payload: Track) {}
}

export type FavoritesActionsUnion =
  AddToFavorites |
  RemoveFromFavorites;
