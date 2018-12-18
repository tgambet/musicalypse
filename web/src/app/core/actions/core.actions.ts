import {Action} from '@ngrx/store';
import {Theme} from '@app/core/core.utils';

export enum CoreActionTypes {
  OpenSidenav   = 'core/sidenav/open',
  CloseSidenav  = 'core/sidenav/close',
  ToggleSidenav = 'core/sidenav/toggle',
  ChangeTheme   = 'core/theme',
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

export type CoreActionsUnion =
  OpenSidenav |
  CloseSidenav |
  ToggleSidenav |
  ChangeTheme;
