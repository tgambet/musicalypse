import {Action} from '@ngrx/store';
import {LyricsOptions} from '@app/model';

export enum SettingsActionTypes {
  AddLibraryFolder           = 'settings/library/add',
  AddLibraryFolderSuccess    = 'settings/library/add/success',
  AddLibraryFolderFailure    = 'settings/library/add/failure',
  RemoveLibraryFolder        = 'settings/library/remove',
  RemoveLibraryFolderSuccess = 'settings/library/remove/success',
  RemoveLibraryFolderFailure = 'settings/library/remove/failure',
  LoadLibraryFolders         = 'settings/library/load',
  LoadLibraryFoldersSuccess  = 'settings/library/load/success',
  LoadLibraryFoldersFailure  = 'settings/library/load/failure',
  SetLyricsOptions           = 'settings/lyrics'
}

export class AddLibraryFolder implements Action {
  readonly type = SettingsActionTypes.AddLibraryFolder;
  constructor(public payload: string) {}
}

export class AddLibraryFolderSuccess implements Action {
  readonly type = SettingsActionTypes.AddLibraryFolderSuccess;
  constructor(public payload: string) {}
}

export class AddLibraryFolderFailure implements Action {
  readonly type = SettingsActionTypes.AddLibraryFolderFailure;
  constructor(public payload: string) {}
}

export class RemoveLibraryFolder implements Action {
  readonly type = SettingsActionTypes.RemoveLibraryFolder;
  constructor(public payload: string) {}
}

export class RemoveLibraryFolderSuccess implements Action {
  readonly type = SettingsActionTypes.RemoveLibraryFolderSuccess;
  constructor(public payload: string) {}
}

export class RemoveLibraryFolderFailure implements Action {
  readonly type = SettingsActionTypes.RemoveLibraryFolderFailure;
  constructor(public payload: string) {}
}

export class LoadLibraryFolders implements Action {
  readonly type = SettingsActionTypes.LoadLibraryFolders;
}

export class LoadLibraryFoldersSuccess implements Action {
  readonly type = SettingsActionTypes.LoadLibraryFoldersSuccess;
  constructor(public payload: string[]) {}
}

export class LoadLibraryFoldersFailure implements Action {
  readonly type = SettingsActionTypes.LoadLibraryFoldersFailure;
  constructor(public payload: string) {}
}

export class SetLyricsOptions implements Action {
  readonly type = SettingsActionTypes.SetLyricsOptions;
  constructor(public payload: LyricsOptions) {}
}

export type SettingsActionsUnion =
  AddLibraryFolder |
  AddLibraryFolderSuccess |
  AddLibraryFolderFailure |
  RemoveLibraryFolder |
  RemoveLibraryFolderSuccess |
  RemoveLibraryFolderFailure |
  LoadLibraryFolders |
  LoadLibraryFoldersSuccess |
  LoadLibraryFoldersFailure |
  SetLyricsOptions;
