import {Action} from '@ngrx/store';
import {Artist} from '@app/model';

export enum ArtistsActionTypes {
  LoadArtists        = 'library/artists/load',
  SelectArtist       = 'library/artists/select-add',
  SelectArtists      = 'library/artists/select',
  SelectArtistsByIds = 'library/artists/select-by-id',
  DeselectArtist     = 'library/artists/deselect',
  DeselectAllArtists = 'library/artists/deselect-all',
}

export class LoadArtists implements Action {
  readonly type = ArtistsActionTypes.LoadArtists;
  constructor(public payload: Artist[]) {}
}

export class SelectArtist implements Action {
  readonly type = ArtistsActionTypes.SelectArtist;
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

export class DeselectArtist implements Action {
  readonly type = ArtistsActionTypes.DeselectArtist;
  constructor(public payload: Artist) {}
}

export class DeselectAllArtists implements Action {
  readonly type = ArtistsActionTypes.DeselectAllArtists;
}

export type ArtistsActionsUnion =
  LoadArtists |
  DeselectArtist |
  SelectArtist |
  SelectArtists |
  SelectArtistsByIds |
  DeselectAllArtists;
