import {SettingsActionsUnion, SettingsActionTypes} from '../settings.actions';

/**
 * State
 */
export interface State {
  libraryFolders: string[];
  error: string;
}

const initialState: State = {
  libraryFolders: [],
  error: ''
};

/**
 * Reducer
 */
export function reducer(
  state: State = initialState,
  action: SettingsActionsUnion
): State {
  switch (action.type) {

    case SettingsActionTypes.LoadLibraryFoldersSuccess:
      return {
        ...state,
        libraryFolders: action.payload,
        error: ''
      };

    case SettingsActionTypes.LoadLibraryFoldersFailure:
      return {
        ...state,
        error: action.payload
      };

    case SettingsActionTypes.AddLibraryFolderSuccess:
      return {
        ...state,
        libraryFolders: [...state.libraryFolders, action.payload],
        error: ''
      };

    case SettingsActionTypes.AddLibraryFolderFailure:
      return {
        ...state,
        error: action.payload
      };

    case SettingsActionTypes.RemoveLibraryFolderSuccess:
      return {
        ...state,
        libraryFolders: state.libraryFolders.filter(folder => folder !== action.payload),
        error: ''
      };

    case SettingsActionTypes.RemoveLibraryFolderFailure:
      return {
        ...state,
        error: action.payload
      };

    case SettingsActionTypes.LoadLibraryFolders:
    case SettingsActionTypes.AddLibraryFolder:
    case SettingsActionTypes.RemoveLibraryFolder:
    default:
      return state;
  }
}

/**
 * Selectors
 */
export const getLibraryFolders = (state: State) => state.libraryFolders;
export const getSettingsError = (state: State) => state.error;
