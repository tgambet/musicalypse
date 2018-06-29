import {Action} from '@ngrx/store';
import {Track} from '@app/model';

export enum TracksActionTypes {
  AddTracks = '[Tracks] Add Tracks',
  RemoveTracks = '[Tracks] Remove Tracks',
  LoadTracks = '[Tracks] Load Tracks',
  LoadTracksSuccess = '[Tracks] Load Tracks Success',
  LoadTracksFailure = '[Tracks] Load Tracks Failure',
  ScanTracks = '[Tracks] Scan Tracks',
}

export class AddTracks implements Action {
  readonly type = TracksActionTypes.AddTracks;
  constructor(public payload: Track[]) {}
}

export class RemoveTracks implements Action {
  readonly type = TracksActionTypes.RemoveTracks;
  constructor(public payload: Track[]) {}
}

export class LoadTracks implements Action {
  readonly type = TracksActionTypes.LoadTracks;
}

export class LoadTrackSuccess implements Action {
  readonly type = TracksActionTypes.LoadTracksSuccess;
  constructor(public payload: Track[]) {}
}

export class LoadTrackFailure implements Action {
  readonly type = TracksActionTypes.LoadTracksFailure;
  constructor(public payload: string) {}
}

export class ScanTracks implements Action {
  readonly type = TracksActionTypes.ScanTracks;
}

export type TracksActionsUnion =
  AddTracks |
  RemoveTracks |
  LoadTracks |
  LoadTrackSuccess |
  LoadTrackFailure |
  ScanTracks;
