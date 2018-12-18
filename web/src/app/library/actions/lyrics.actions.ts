import {Action} from '@ngrx/store';

export enum LyricsActionTypes {
  SetLyricsLoading = '[Lyrics] Set Loading',
}

export class SetLyricsLoading implements Action {
  readonly type = LyricsActionTypes.SetLyricsLoading;
  constructor(public payload: boolean) {}
}

export type LyricsActionsUnion =
  SetLyricsLoading;
