import {Action} from '@ngrx/store';
import {Album} from '@app/model';

export enum AlbumsActionTypes {
  LoadAlbums = '[Albums] Load Albums',
  SelectAlbum = '[Albums] Select Album',
  DeselectAlbum = '[Albums] Deselect Album',
  SelectAlbums = '[Albums] Select Albums',
  SelectAllAlbums = '[Albums] Select All Albums',
  DeselectAllAlbums = '[Albums] Deselect All Albums',
}

export class LoadAlbums implements Action {
  readonly type = AlbumsActionTypes.LoadAlbums;
  constructor(public payload: Album[]) {}
}

export class SelectAlbum implements Action {
  readonly type = AlbumsActionTypes.SelectAlbum;
  constructor(public payload: Album) {}
}

export class DeselectAlbum implements Action {
  readonly type = AlbumsActionTypes.DeselectAlbum;
  constructor(public payload: Album) {}
}

export class SelectAlbums implements Action {
  readonly type = AlbumsActionTypes.SelectAlbums;
  constructor(public payload: Album[]) {}
}

export class SelectAllAlbums implements Action {
  readonly type = AlbumsActionTypes.SelectAllAlbums;
}

export class DeselectAllAlbums implements Action {
  readonly type = AlbumsActionTypes.DeselectAllAlbums;
}

export type AlbumsActionsUnion =
  LoadAlbums |
  SelectAlbum |
  DeselectAlbum |
  SelectAlbums |
  SelectAllAlbums |
  DeselectAllAlbums;
