import {Track} from '@app/model';
import {Action} from '@ngrx/store';

export enum PlayerActionTypes {
  PlayTrackNext = '[Player] Play Track Next',
  AddToCurrentPlaylist = '[Player] Add To Current Playlist',
  PlayNextTrack = '[Player] Play Next Track',
  PlayPreviousTrack = '[Player] Play Previous Track',
  SetRepeat = '[Player] Set Repeat',
  SetShuffle = '[Player] Set Shuffle',
  SetCurrentTrack = '[Player] Set Track',
  SetCurrentPlaylist = '[Player] Set Playlist',
}

export class PlayTrackNext implements Action {
  readonly type = PlayerActionTypes.PlayTrackNext;
  constructor(public payload: Track) {}
}

export class AddToCurrentPlaylist implements Action {
  readonly type = PlayerActionTypes.AddToCurrentPlaylist;
  constructor(public payload: Track[]) {}
}

export class PlayNextTrack implements Action {
  readonly type = PlayerActionTypes.PlayNextTrack;
}

export class PlayPreviousTrack implements Action {
  readonly type = PlayerActionTypes.PlayPreviousTrack;
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
  PlayNextTrack |
  PlayPreviousTrack |
  SetRepeat |
  SetShuffle |
  SetCurrentTrack |
  SetCurrentPlaylist;
