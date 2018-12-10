import {Action} from '@ngrx/store';
import {Theme} from '@app/core/core.utils';

export enum CoreActionTypes {
  OpenSidenav = '[Core] Open Sidenav',
  CloseSidenav = '[Core] Close Sidenav',
  ToggleSidenav = '[Core] Toggle Sidenav',
  ChangeTheme = '[Core] Change Theme',
  SetAudioSource = '[Core] Set Audio Source',
  SetAudioVolume = '[Core] Set Audio Volume',
  SetAudioMuted = '[Core] Set Audio Muted',
  SetAudioLoading = '[Core] Set Audio Loading',
  SetAudioPlaying = '[Core] Set Audio Playing',
  SetAudioDuration = '[Core] Set Audio Duration',
  SetAudioError = '[Core] Set Audio Error',
}

export class OpenSidenav implements Action {
  readonly type = CoreActionTypes.OpenSidenav;
}

export class CloseSidenav implements Action {
  readonly type = CoreActionTypes.CloseSidenav;
}

export class ToggleSidenav implements Action {
  readonly type = CoreActionTypes.ToggleSidenav;
}

export class ChangeTheme implements Action {
  readonly type = CoreActionTypes.ChangeTheme;
  constructor(public payload: Theme) {}
}

export class SetAudioSource implements Action {
  readonly type = CoreActionTypes.SetAudioSource;
  constructor(public payload: string) {}
}

export class SetAudioVolume implements Action {
  readonly type = CoreActionTypes.SetAudioVolume;
  constructor(public payload: number) {}
}

export class SetAudioMuted implements Action {
  readonly type = CoreActionTypes.SetAudioMuted;
  constructor(public payload: boolean) {}
}

export class SetAudioLoading implements Action {
  readonly type = CoreActionTypes.SetAudioLoading;
  constructor(public payload: boolean) {}
}

export class SetAudioPlaying implements Action {
  readonly type = CoreActionTypes.SetAudioPlaying;
  constructor(public payload: boolean) {}
}

export class SetAudioDuration implements Action {
  readonly type = CoreActionTypes.SetAudioDuration;
  constructor(public payload: number) {}
}

export class SetAudioError implements Action {
  readonly type = CoreActionTypes.SetAudioError;
  constructor(public payload: string) {}
}

export type CoreActionsUnion =
  OpenSidenav |
  CloseSidenav |
  ToggleSidenav |
  ChangeTheme |
  SetAudioSource |
  SetAudioVolume |
  SetAudioMuted |
  SetAudioLoading |
  SetAudioPlaying |
  SetAudioDuration |
  SetAudioError;
