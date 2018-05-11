import {Action} from '@ngrx/store';
import {Playlist, Track} from '@app/model';

export enum PlaylistsActionTypes {
  LoadPlaylists = '[Playlists] Load Playlists',
  LoadPlaylist = '[Playlists] Load Playlist',
  SavePlaylist = '[Playlists] Save Playlist',
  DeletePlaylist = '[Playlists] Delete Playlist',
  AddToPlaylist = '[Playlists] Add To Playlist',
  RemoveFromPlaylist = '[Playlists] Remove From Playlist'
}

export class LoadPlaylists implements Action {
  readonly type = PlaylistsActionTypes.LoadPlaylists;
  constructor(public playlists: Playlist[]) {}
}

export class LoadPlaylist implements Action {
  readonly type = PlaylistsActionTypes.LoadPlaylist;
  constructor(public playlist: Playlist) {}
}

export class SavePlaylist implements Action {
  readonly type = PlaylistsActionTypes.SavePlaylist;
  constructor(public name: string, public tracks: Track[]) {}
}

export class DeletePlaylist implements Action {
  readonly type = PlaylistsActionTypes.DeletePlaylist;
  constructor(public name: string) {}
}

export class AddToPlaylist implements Action {
  readonly type = PlaylistsActionTypes.AddToPlaylist;
  constructor(public tracks: Track[], public playlist: string) {}
}

export class RemoveFromPlaylist implements Action {
  readonly type = PlaylistsActionTypes.RemoveFromPlaylist;
  constructor(public track: Track, public playlist: string) {}
}

export type PlaylistsActionUnion =
  LoadPlaylists |
  LoadPlaylist |
  SavePlaylist |
  DeletePlaylist |
  AddToPlaylist |
  RemoveFromPlaylist;
