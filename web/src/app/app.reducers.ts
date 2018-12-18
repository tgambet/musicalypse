import {ActionReducerMap, createFeatureSelector, createSelector, MetaReducer} from '@ngrx/store';
import {environment} from '@env/environment';
import {routerReducer, RouterReducerState} from '@ngrx/router-store';
import {RouterStateUrl} from '@app/app.serializer';

export interface State {
  router: RouterReducerState<RouterStateUrl>;
}

/**
 * Our state is composed of a map of action reducer functions.
 * These reducer functions are called with each dispatched action
 * and the current or initial state and return a new immutable state.
 */
export const reducers: ActionReducerMap<State> = {
  router: routerReducer
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

export const getRouterState =  createSelector(
  createFeatureSelector<RouterReducerState<RouterStateUrl>>('router'),
  (state) => state.state
);
