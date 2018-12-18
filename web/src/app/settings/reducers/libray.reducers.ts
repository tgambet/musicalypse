import {SettingsActionsUnion, SettingsActionTypes} from '../settings.actions';

/**
 * State
 */
export interface State {
  folders: string[];
  error: string;
  loading: boolean;
}

const initialState: State = {
  folders: [],
  error: '',
  loading: false
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
        folders: action.payload,
        error: '',
        loading: false
      };

    case SettingsActionTypes.LoadLibraryFoldersFailure:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case SettingsActionTypes.AddLibraryFolderSuccess:
      return {
        ...state,
        folders: [...state.folders, action.payload],
        error: '',
        loading: false
      };

    case SettingsActionTypes.AddLibraryFolderFailure:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case SettingsActionTypes.RemoveLibraryFolderSuccess:
      return {
        ...state,
        folders: state.folders.filter(folder => folder !== action.payload),
        error: '',
        loading: false
      };

    case SettingsActionTypes.RemoveLibraryFolderFailure:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case SettingsActionTypes.LoadLibraryFolders:
    case SettingsActionTypes.AddLibraryFolder:
    case SettingsActionTypes.RemoveLibraryFolder:
      return {
        ...state,
        loading: true
      };

    default:
      return state;
  }
}

/**
 * Selectors
 */
export const getLibraryFolders = (state: State) => state.folders;
export const getError = (state: State) => state.error;
export const getLoading = (state: State) => state.loading;
