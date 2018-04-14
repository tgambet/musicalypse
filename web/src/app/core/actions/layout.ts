import { Action } from '@ngrx/store';

export enum LayoutActionTypes {
  OpenSidenav = '[Layout] Open Sidenav',
  CloseSidenav = '[Layout] Close Sidenav',
  ToggleSideNav = '[Layout] Toggle Sidenav'
}

export class OpenSidenav implements Action {
  readonly type = LayoutActionTypes.OpenSidenav;
}

export class CloseSidenav implements Action {
  readonly type = LayoutActionTypes.CloseSidenav;
}

export class ToggleSidenav implements Action {
  readonly type = LayoutActionTypes.ToggleSideNav;
}

export type LayoutActionsUnion = OpenSidenav | CloseSidenav | ToggleSidenav;
