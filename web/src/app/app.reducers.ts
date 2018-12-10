import {ActionReducerMap, createFeatureSelector, createSelector, MetaReducer} from '@ngrx/store';
import {environment} from '@env/environment';

import * as fromCore from './core/core.reducers';

export interface State {
  core: fromCore.State;
}

/**
 * Our state is composed of a map of action reducer functions.
 * These reducer functions are called with each dispatched action
 * and the current or initial state and return a new immutable state.
 */
export const reducers: ActionReducerMap<State> = {
  core: fromCore.reducer,
};

// console.log all actions
// export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
//   return function(state: State, action: any): State {
//     console.log('state', state);
//     console.log('action', action);
//
//     return reducer(state, action);
//   };
// }

/**
 * By default, @ngrx/store uses combineReducers with the reducer map to compose
 * the root meta-reducer. To add more meta-reducers, provide an array of meta-reducers
 * that will be composed to form the root meta-reducer.
 */
export const metaReducers: MetaReducer<State>[] = !environment.production ? [/*logger*/] : [];

/**
 * Core Reducers
 */
export const getCoreState = createFeatureSelector<fromCore.State>('core');

export const getShowSidenav = createSelector(
  getCoreState,
  fromCore.getShowSidenav
);

export const getCurrentTheme = createSelector(
  getCoreState,
  fromCore.getCurrentTheme
);

export const getAudioInput = createSelector(
  getCoreState,
  fromCore.getAudioInput
);

export const getAudioPlaying = createSelector(
  getCoreState,
  fromCore.getAudioPlaying
);

export const getAudioLoading = createSelector(
  getCoreState,
  fromCore.getAudioLoading
);

export const getAudioDuration = createSelector(
  getCoreState,
  fromCore.getAudioDuration
);

export const getAudioMuted = createSelector(
  getCoreState,
  fromCore.getAudioMuted
);

export const getAudioVolume = createSelector(
  getCoreState,
  fromCore.getAudioVolume
);
