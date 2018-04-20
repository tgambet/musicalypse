import {Action} from '@ngrx/store';
import {Track} from '@app/model';

export enum TracksActionTypes {
  AddTrack = '[Tracks] Add Track',
  RemoveTrack = '[Tracks] Remove Track',
  LoadTracks = '[Tracks] Load Tracks',
  LoadTracksSuccess = '[Tracks] Load Tracks Success',
  LoadTracksFailure = '[Tracks] Load Tracks Failure',
}

export class AddTrack implements Action {
  readonly type = TracksActionTypes.AddTrack;
  constructor(public payload: Track) {}
}

export class RemoveTrack implements Action {
  readonly type = TracksActionTypes.RemoveTrack;
  constructor(public payload: Track) {}
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

export type TracksActionsUnion =
  AddTrack |
  RemoveTrack |
  LoadTracks |
  LoadTrackSuccess |
  LoadTrackFailure;
