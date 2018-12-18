import {Action} from '@ngrx/store';
import {Track} from '@app/model';

export enum LyricsActionTypes {
  LoadLyrics        = 'library/lyrics/load',
  LoadLyricsSuccess = 'library/lyrics/load/success',
  LoadLyricsFailure = 'library/lyrics/load/failure',
}

export class LoadLyrics implements Action {
  readonly type = LyricsActionTypes.LoadLyrics;
  constructor(public payload: Track) {}
}

export class LoadLyricsSuccess implements Action {
  readonly type = LyricsActionTypes.LoadLyricsSuccess;
  constructor(public lyrics: string, public source: string) {}
}

export class LoadLyricsFailure implements Action {
  readonly type = LyricsActionTypes.LoadLyricsFailure;
  constructor(public error: string) {}
}

export type LyricsActionsUnion =
  LoadLyrics |
  LoadLyricsSuccess |
  LoadLyricsFailure;
