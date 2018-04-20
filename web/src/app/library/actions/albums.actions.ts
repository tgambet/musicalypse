import {Action} from '@ngrx/store';
import {Album} from '@app/model';

export enum AlbumsActionTypes {
  LoadAlbums = '[Albums] Load Albums',
  SelectAlbum = '[Albums] Select Album',
}

export class LoadAlbums implements Action {
  readonly type = AlbumsActionTypes.LoadAlbums;
  constructor(public payload: Album[]) {}
}

export class SelectAlbum implements Action {
  readonly type = AlbumsActionTypes.SelectAlbum;
  constructor(public payload: Album) {}
}

export type AlbumsActionsUnion =
  LoadAlbums |
  SelectAlbum;
