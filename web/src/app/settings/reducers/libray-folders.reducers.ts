import {SettingsActionsUnion, SettingsActionTypes} from '../settings.actions';

/**
 * State
 */
export interface State {
  libraryFolders: string[];
  error: string;
  loading: boolean;
}

const initialState: State = {
  libraryFolders: [],
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
        libraryFolders: action.payload,
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
        libraryFolders: [...state.libraryFolders, action.payload],
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
        libraryFolders: state.libraryFolders.filter(folder => folder !== action.payload),
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
export const getLibraryFolders = (state: State) => state.libraryFolders;
export const getError = (state: State) => state.error;
export const getLoading = (state: State) => state.loading;
