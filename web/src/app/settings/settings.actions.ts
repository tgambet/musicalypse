import {Action} from '@ngrx/store';

export enum SettingsActionTypes {
  AddLibraryFolder = '[Settings] Add Library Folder',
  RemoveLibraryFolder = '[Settings] Remove Library Folder',
  LoadLibraryFolders = '[Settings] Load Library Folders',
  LoadLibraryFoldersSuccess = '[Settings] Load Library Folders Success',
  LoadLibraryFoldersFailure = '[Settings] Load Library Folders Failure',
}

export class AddLibraryFolder implements Action {
  readonly type = SettingsActionTypes.AddLibraryFolder;
  constructor(public payload: string) {}
}

export class RemoveLibraryFolder implements Action {
  readonly type = SettingsActionTypes.RemoveLibraryFolder;
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
  RemoveLibraryFolder |
  LoadLibraryFolders |
  LoadLibraryFoldersSuccess |
  LoadLibraryFoldersFailure;
