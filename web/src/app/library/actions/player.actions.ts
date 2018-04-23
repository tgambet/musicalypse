import {Track} from '@app/model';
import {Action} from '@ngrx/store';

export enum PlayerActionTypes {
  PlayTrack = '[Player] Play Track',
  PlayTrackNext = '[Player] Play Track Next',
  AddTracksToPlaylist = '[Player] Add Tracks To Playlist',
  ResetPlaylist = '[Player] Reset Playlist',
  PlayNextTrackInPlaylist = '[Player] Play Next Track In Playlist',
  PlayPreviousTrackInPlaylist = '[Player] Play Previous Track In Playlist',
  SetRepeat = '[Player] Set Repeat',
  SetShuffle = '[Player] Set Shuffle',
  SetPlaylist = '[Player] Set Playlist'
}

export class PlayTrack implements Action {
  readonly type = PlayerActionTypes.PlayTrack;
  constructor(public payload: Track) {}
}

export class PlayTrackNext implements Action {
  readonly type = PlayerActionTypes.PlayTrackNext;
  constructor(public payload: Track) {}
}

export class AddTracksToPlaylist implements Action {
  readonly type = PlayerActionTypes.AddTracksToPlaylist;
  constructor(public payload: Track[]) {}
}

export class ResetPlaylist implements Action {
  readonly type = PlayerActionTypes.ResetPlaylist;
}

export class PlayNextTrackInPlaylist implements Action {
  readonly type = PlayerActionTypes.PlayNextTrackInPlaylist;
}

export class PlayPreviousTrackInPlaylist implements Action {
  readonly type = PlayerActionTypes.PlayPreviousTrackInPlaylist;
}

export class SetRepeat implements Action {
  readonly type = PlayerActionTypes.SetRepeat;
  constructor(public payload: boolean) {}
}

export class SetShuffle implements Action {
  readonly type = PlayerActionTypes.SetShuffle;
  constructor(public payload: boolean) {}
}

export class SetPlaylist implements Action {
  readonly type = PlayerActionTypes.SetPlaylist;
  constructor(public payload: Track[]) {}
}

export type PlayerActionsUnion =
  PlayTrack |
  PlayTrackNext |
  AddTracksToPlaylist |
  ResetPlaylist |
  PlayNextTrackInPlaylist |
  PlayPreviousTrackInPlaylist |
  SetRepeat |
  SetShuffle |
  SetPlaylist;
