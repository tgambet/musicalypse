import {Action} from '@ngrx/store';

export enum SettingsActionTypes {
  AddLibraryFolder = '[Settings] Add Library Folder',
  AddLibraryFolderSuccess = '[Settings] Add Library Folder Success',
  AddLibraryFolderFailure = '[Settings] Add Library Folder Failure',
  RemoveLibraryFolder = '[Settings] Remove Library Folder',
  RemoveLibraryFolderSuccess = '[Settings] Remove Library Folder Success',
  RemoveLibraryFolderFailure = '[Settings] Remove Library Folder Failure',
  LoadLibraryFolders = '[Settings] Load Library Folders',
  LoadLibraryFoldersSuccess = '[Settings] Load Library Folders Success',
  LoadLibraryFoldersFailure = '[Settings] Load Library Folders Failure',
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

export type SettingsActionsUnion =
  AddLibraryFolder |
  AddLibraryFolderSuccess |
  AddLibraryFolderFailure |
  RemoveLibraryFolder |
  RemoveLibraryFolderSuccess |
  RemoveLibraryFolderFailure |
  LoadLibraryFolders |
  LoadLibraryFoldersSuccess |
  LoadLibraryFoldersFailure;
