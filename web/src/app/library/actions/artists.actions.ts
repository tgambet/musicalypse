import {Action} from '@ngrx/store';
import {Artist} from '@app/model';

export enum ArtistsActionTypes {
  LoadArtists = '[Artists] Load Artists',
  SelectArtist = '[Artists] Select Artist',
  DeselectArtist = '[Artists] Deselect Artist',
  SelectArtists = '[Artists] Select Artists',
  SelectAllArtists = '[Artists] Select All Artists',
  DeselectAllArtists = '[Artists] Deselect All Artists',
}

export class LoadArtists implements Action {
  readonly type = ArtistsActionTypes.LoadArtists;
  constructor(public payload: Artist[]) {}
}

export class SelectArtist implements Action {
  readonly type = ArtistsActionTypes.SelectArtist;
  constructor(public payload: Artist) {}
}

export class DeselectArtist implements Action {
  readonly type = ArtistsActionTypes.DeselectArtist;
  constructor(public payload: Artist) {}
}

export class SelectArtists implements Action {
  readonly type = ArtistsActionTypes.SelectArtists;
  constructor(public payload: Artist[]) {}
}

export class SelectAllArtists implements Action {
  readonly type = ArtistsActionTypes.SelectAllArtists;
}

export class DeselectAllArtists implements Action {
  readonly type = ArtistsActionTypes.DeselectAllArtists;
}

export type ArtistsActionsUnion =
  LoadArtists |
  // AddArtist |
  // UpdateArtist |
  SelectArtist |
  DeselectArtist |
  SelectArtists |
  SelectAllArtists |
  DeselectAllArtists;
