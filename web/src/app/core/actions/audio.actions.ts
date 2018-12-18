import {Action} from '@ngrx/store';

export enum AudioActionTypes {
  SetAudioSource   = 'core/audio/source',
  SetAudioVolume   = 'core/audio/volume',
  SetAudioMuted    = 'core/audio/muted',
  SetAudioLoading  = 'core/audio/loading',
  SetAudioPlaying  = 'core/audio/playing',
  SetAudioDuration = 'core/audio/duration',
  SetAudioError    = 'core/audio/error',
}

export class SetAudioSource implements Action {
  readonly type = AudioActionTypes.SetAudioSource;
  constructor(public payload: string) {}
}

export class SetAudioVolume implements Action {
  readonly type = AudioActionTypes.SetAudioVolume;
  constructor(public payload: number) {}
}

export class SetAudioMuted implements Action {
  readonly type = AudioActionTypes.SetAudioMuted;
  constructor(public payload: boolean) {}
}

export class SetAudioLoading implements Action {
  readonly type = AudioActionTypes.SetAudioLoading;
  constructor(public payload: boolean) {}
}

export class SetAudioPlaying implements Action {
  readonly type = AudioActionTypes.SetAudioPlaying;
  constructor(public payload: boolean) {}
}

export class SetAudioDuration implements Action {
  readonly type = AudioActionTypes.SetAudioDuration;
  constructor(public payload: number) {}
}

export class SetAudioError implements Action {
  readonly type = AudioActionTypes.SetAudioError;
  constructor(public payload: string) {}
}

export type AudioActionsUnion =
  SetAudioSource |
  SetAudioVolume |
  SetAudioMuted |
  SetAudioLoading |
  SetAudioPlaying |
  SetAudioDuration |
  SetAudioError;
