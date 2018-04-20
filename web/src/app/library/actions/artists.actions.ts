import {Action} from '@ngrx/store';
import {Artist} from '@app/model';

export enum ArtistsActionTypes {
  LoadArtists = '[Artists] Load Artists',
  AddArtist = '[Artists] Add Artist',
  UpdateArtist = '[Artists] Update Artist',
  SelectArtist = '[Artists] Select Artist',
}

export class LoadArtists implements Action {
  readonly type = ArtistsActionTypes.LoadArtists;
  constructor(public payload: Artist[]) {}
}

export class AddArtist implements Action {
  readonly type = ArtistsActionTypes.AddArtist;
  constructor(public payload: Artist) {}
}

export class UpdateArtist implements Action {
  readonly type = ArtistsActionTypes.UpdateArtist;
  constructor(public payload: Artist) {}
}

export class SelectArtist implements Action {
  readonly type = ArtistsActionTypes.SelectArtist;
  constructor(public payload: Artist) {}
}

export type ArtistsActionsUnion =
  LoadArtists |
  AddArtist |
  UpdateArtist |
  SelectArtist;
