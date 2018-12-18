import {Action} from '@ngrx/store';
import {Playlist, Track} from '@app/model';

export enum PlaylistsActionTypes {
  LoadPlaylists      = 'library/playlists/load',
  LoadPlaylist       = 'library/playlists/load-playlist',
  SavePlaylist       = 'library/playlists/save',
  DeletePlaylist     = 'library/playlists/delete',
  AddToPlaylist      = 'library/playlists/add',
  RemoveFromPlaylist = 'library/playlists/remove'
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
  constructor(public tracks: Track[], public playlistName: string) {}
}

export class RemoveFromPlaylist implements Action {
  readonly type = PlaylistsActionTypes.RemoveFromPlaylist;
  constructor(public track: Track, public playlistName: string) {}
}

export type PlaylistsActionUnion =
  LoadPlaylists |
  LoadPlaylist |
  SavePlaylist |
  DeletePlaylist |
  AddToPlaylist |
  RemoveFromPlaylist;
