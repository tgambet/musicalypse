import {Action} from '@ngrx/store';
import {Album} from '@app/model';

export enum AlbumsActionTypes {
  LoadAlbums = '[Albums] Load Albums',
  SelectAlbums = '[Albums] Select Albums',
  SelectAllAlbums = '[Albums] Select All Albums',
}

export class LoadAlbums implements Action {
  readonly type = AlbumsActionTypes.LoadAlbums;
  constructor(public payload: Album[]) {}
}

export class SelectAlbums implements Action {
  readonly type = AlbumsActionTypes.SelectAlbums;
  constructor(public payload: Album[]) {}
}

export class SelectAllAlbums implements Action {
  readonly type = AlbumsActionTypes.SelectAllAlbums;
}

export type AlbumsActionsUnion =
  LoadAlbums |
  SelectAlbums |
  SelectAllAlbums;
