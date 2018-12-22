import {Action} from '@ngrx/store';
import {Album} from '@app/model';

export enum AlbumsActionTypes {
  LoadAlbums        = 'library/albums/load',
  SelectAlbum       = 'library/albums/select-add',
  SelectAlbums      = 'library/albums/select',
  SelectAlbumsByIds = 'library/albums/select-by-id',
  DeselectAlbum     = 'library/albums/deselect',
  DeselectAllAlbums = 'library/albums/deselect-all',
}

export class LoadAlbums implements Action {
  readonly type = AlbumsActionTypes.LoadAlbums;
  constructor(public payload: Album[]) {}
}

export class SelectAlbum implements Action {
  readonly type = AlbumsActionTypes.SelectAlbum;
  constructor(public payload: Album) {}
}

export class SelectAlbums implements Action {
  readonly type = AlbumsActionTypes.SelectAlbums;
  constructor(public payload: Album[]) {}
}

export class SelectAlbumsByIds implements Action {
  readonly type = AlbumsActionTypes.SelectAlbumsByIds;
  constructor(public payload: (string | number)[]) {}
}

export class DeselectAlbum implements Action {
  readonly type = AlbumsActionTypes.DeselectAlbum;
  constructor(public payload: Album) {}
}

export class DeselectAllAlbums implements Action {
  readonly type = AlbumsActionTypes.DeselectAllAlbums;
}

export type AlbumsActionsUnion =
  LoadAlbums |
  SelectAlbum |
  SelectAlbums |
  SelectAlbumsByIds |
  DeselectAlbum |
  DeselectAllAlbums;
