import {Track} from '@app/model';
import {Action} from '@ngrx/store';

export enum PlayerActionTypes {
  PlayTrackNext        = 'library/player/play-track-next',
  AddToCurrentPlaylist = 'library/player/add-to-playlist',
  SetRepeat            = 'library/player/repeat',
  SetShuffle           = 'library/player/shuffle',
  SetCurrentTrack      = 'library/player/track',
  SetCurrentPlaylist   = 'library/player/playlist',
  SetNextTrack         = 'library/player/next',
  SetPreviousTrack     = 'library/player/previous',
}

export class PlayTrackNext implements Action {
  readonly type = PlayerActionTypes.PlayTrackNext;
  constructor(public payload: Track) {}
}

export class AddToCurrentPlaylist implements Action {
  readonly type = PlayerActionTypes.AddToCurrentPlaylist;
  constructor(public payload: Track[]) {}
}

export class SetNextTrack implements Action {
  readonly type = PlayerActionTypes.SetNextTrack;
}

export class SetPreviousTrack implements Action {
  readonly type = PlayerActionTypes.SetPreviousTrack;
}

export class SetRepeat implements Action {
  readonly type = PlayerActionTypes.SetRepeat;
  constructor(public payload: boolean) {}
}

export class SetShuffle implements Action {
  readonly type = PlayerActionTypes.SetShuffle;
  constructor(public payload: boolean) {}
}

export class SetCurrentTrack implements Action {
  readonly type = PlayerActionTypes.SetCurrentTrack;
  constructor(public payload: Track) {}
}

export class SetCurrentPlaylist implements Action {
  readonly type = PlayerActionTypes.SetCurrentPlaylist;
  constructor(public payload: Track[]) {}
}

export type PlayerActionsUnion =
  PlayTrackNext |
  AddToCurrentPlaylist |
  SetNextTrack |
  SetPreviousTrack |
  SetRepeat |
  SetShuffle |
  SetCurrentTrack |
  SetCurrentPlaylist;
