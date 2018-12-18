import {ActionReducerMap, createFeatureSelector, createSelector} from '@ngrx/store';

import * as fromCore from './reducers/core.reducers';
import * as fromAudio from './reducers/audio.reducers';

/**
 * State
 */
export interface State {
  core: fromCore.State;
  audio: fromAudio.State;
}

export const reducers: ActionReducerMap<State> = {
  core: fromCore.reducer,
  audio: fromAudio.reducer,
};

/**
 * Selectors
 */
export const getCoreFeatureState = createFeatureSelector('core');

export const getCoreState = createSelector(
  getCoreFeatureState,
  (state: State) => state.core
);

export const getAudioState = createSelector(
  getCoreFeatureState,
  (state: State) => state.audio
);

export const getShowSidenav = createSelector(
  getCoreState,
  fromCore.getShowSidenav
);

export const getCurrentTheme = createSelector(
  getCoreState,
  fromCore.getCurrentTheme
);

export const getAudioInput = createSelector(
  getAudioState,
  fromAudio.getAudioInput
);

export const getAudioPlaying = createSelector(
  getAudioState,
  fromAudio.getAudioPlaying
);

export const getAudioLoading = createSelector(
  getAudioState,
  fromAudio.getAudioLoading
);

export const getAudioDuration = createSelector(
  getAudioState,
  fromAudio.getAudioDuration
);

export const getAudioMuted = createSelector(
  getAudioState,
  fromAudio.getAudioMuted
);

export const getAudioVolume = createSelector(
  getAudioState,
  fromAudio.getAudioVolume
);


