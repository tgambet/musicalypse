import {Track} from '@app/model';
import {Action} from '@ngrx/store';

export enum RecentActionTypes {
  AddToRecent = '[Recent] Add To Recent Tracks'
}

export class AddToRecent implements Action {
  readonly type = RecentActionTypes.AddToRecent;
  constructor(public payload: Track[]) {}
}

export type RecentActionsUnion = AddToRecent;
