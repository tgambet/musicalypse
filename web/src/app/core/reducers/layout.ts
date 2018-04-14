import { LayoutActionTypes, LayoutActionsUnion } from '../actions/layout';

/**
 * State
 */
export interface State {
  showSidenav: boolean;
}

const initialState: State = {
  showSidenav: false,
};

/**
 * Reducers
 * @param {State} state
 * @param {LayoutActionsUnion} action
 * @returns {State}
 */
export function reducer(
  state: State = initialState,
  action: LayoutActionsUnion
): State {
  switch (action.type) {
    case LayoutActionTypes.CloseSidenav:
      return {
        showSidenav: false,
      };

    case LayoutActionTypes.OpenSidenav:
      return {
        showSidenav: true,
      };

    case LayoutActionTypes.ToggleSideNav:
      return {
        showSidenav: !state.showSidenav,
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
