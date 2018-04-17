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

    case SettingsActionTypes.AddLibraryFolder:
      return {
        ...state,
        libraryFolders: [...state.libraryFolders, action.payload],
      };

    case SettingsActionTypes.RemoveLibraryFolder:
      return {
        ...state,
        libraryFolders: state.libraryFolders.filter(folder => folder !== action.payload),
      };

    case SettingsActionTypes.LoadLibraryFolders:
      return state;

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

    default:
      return state;
  }
}

/**
 * Selectors
 */
export const getLibraryFolders = (state: State) => state.libraryFolders;
export const getSettingsError = (state: State) => state.error;
