import {ActionReducerMap, createFeatureSelector, createSelector} from '@ngrx/store';

import * as fromLibraryFolders from './reducers/libray-folders.reducers';
import * as fromRoot from '@app/app.reducers';

export interface SettingsState {
  libraryFolders: fromLibraryFolders.State;
}

export interface State extends fromRoot.State {
  settings: SettingsState;
}

export const reducers: ActionReducerMap<SettingsState> = {
  libraryFolders: fromLibraryFolders.reducer
};

export const getSettingsState = createFeatureSelector<SettingsState>('settings');

export const getLibraryFoldersState = createSelector(
  getSettingsState,
  state => state.libraryFolders
);

export const getLibraryFolders = createSelector(
  getLibraryFoldersState,
  fromLibraryFolders.getLibraryFolders
);

export const getSettingsError = createSelector(
  getLibraryFoldersState,
  fromLibraryFolders.getError
);

export const getSettingsLoading = createSelector(
  getLibraryFoldersState,
  fromLibraryFolders.getLoading
);
