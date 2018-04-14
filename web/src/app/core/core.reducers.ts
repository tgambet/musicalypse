import {CoreActionsUnion, CoreActionTypes} from './core.actions';
import {Theme} from '@app/model';

/**
 * State
 */
export interface State {
  showSidenav: boolean;
  currentTheme: Theme;
}

const initialState: State = {
  showSidenav: false,
  currentTheme: {name: 'Dark/Green', cssClass: 'dark-theme', color: '#212121'}
};

/**
 * Reducers
 * @param {State} state
 * @param {CoreActionsUnion} action
 * @returns {State}
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
 * @param {State} state
 * @returns {boolean}
 */
export const getShowSidenav = (state: State) => state.showSidenav;
export const getCurrentTheme = (state: State) => state.currentTheme;
