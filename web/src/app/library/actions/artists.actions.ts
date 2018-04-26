import {Action} from '@ngrx/store';
import {Artist} from '@app/model';

export enum ArtistsActionTypes {
  LoadArtists = '[Artists] Load Artists',
  SelectArtist = '[Artists] Select Artist',
  DeselectArtist = '[Artists] Deselect Artist',
  SelectArtists = '[Artists] Select Artists',
  SelectArtistsByIds = '[Artists] Select Artists By Ids',
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

export class SelectArtistsByIds implements Action {
  readonly type = ArtistsActionTypes.SelectArtistsByIds;
  constructor(public payload: (string | number)[]) {}
}

export class DeselectAllArtists implements Action {
  readonly type = ArtistsActionTypes.DeselectAllArtists;
}

export type ArtistsActionsUnion =
  LoadArtists |
  SelectArtist |
  DeselectArtist |
  SelectArtists |
  SelectArtistsByIds |
  DeselectAllArtists;
