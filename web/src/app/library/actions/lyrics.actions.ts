import {Action} from '@ngrx/store';
import {Track} from '@app/model';

export enum LyricsActionTypes {
  LoadLyrics = '[Lyrics] Load Lyrics',
  LoadLyricsSuccess = '[Lyrics] Load Lyrics Success',
  LoadLyricsFailure = '[Lyrics] Load Lyrics Failure',
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
