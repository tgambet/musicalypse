/**
 * State
 */
import {CoreUtils, Theme} from '@app/core/core.utils';
import {CoreActionsUnion, CoreActionTypes} from '@app/core/actions/core.actions';

export interface State {
  showSidenav: boolean;
  currentTheme: Theme;
}

const initialState: State = {
  showSidenav: false,
  currentTheme: CoreUtils.allThemes[0],
};

/**
 * Reducer
 */
export function reducer(
  state: State = initialState,
  action: CoreActionsUnion
): State {
  switch (action.type) {

    case CoreActionTypes.OpenSidenav:
      return {
        ...state,
        showSidenav: true,
      };

    case CoreActionTypes.CloseSidenav:
      return {
        ...state,
        showSidenav: false,
      };

    case CoreActionTypes.ToggleSidenav:
      return {
        ...state,
        showSidenav: !state.showSidenav,
      };

    case CoreActionTypes.ChangeTheme:
      return {
        ...state,
        currentTheme: action.payload,
      };

    default:
      return state;
  }
}

/**
 * Selectors
 */
export const getShowSidenav = (state: State) => state.showSidenav;
export const getCurrentTheme = (state: State) => state.currentTheme;
