import {CoreActionsUnion, CoreActionTypes} from './core.actions';
import {CoreUtils, Theme} from '@app/core/core.utils';

/**
 * State
 */
export interface State {
  showSidenav: boolean;
  currentTheme: Theme;
  audioInput: {
    source: string;
    volume: number;
    muted: boolean;
  };
  audioState: {
    loading: boolean;
    playing: boolean;
    duration: number;
    error: string;
  };
}

const initialState: State = {
  showSidenav: false,
  currentTheme: CoreUtils.allThemes[0],
  audioInput: {
    source: null,
    volume: 1,
    muted: false,
  },
  audioState: {
    loading: false,
    playing: false,
    duration: 0,
    error: null
  },
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

    case CoreActionTypes.SetAudioSource:
      return {
        ...state,
        audioInput: {
          ...state.audioInput,
          source: action.payload
        }
      };

    case CoreActionTypes.SetAudioVolume:
      return {
        ...state,
        audioInput: {
          ...state.audioInput,
          volume: action.payload
        }
      };

    case CoreActionTypes.SetAudioMuted:
      return {
        ...state,
        audioInput: {
          ...state.audioInput,
          muted: action.payload
        }
      };

    case CoreActionTypes.SetAudioDuration:
      return {
        ...state,
        audioState: {
          ...state.audioState,
          duration: action.payload
        }
      };

    case CoreActionTypes.SetAudioError:
      return {
        ...state,
        audioState: {
          ...state.audioState,
          error: action.payload
        }
      };

    case CoreActionTypes.SetAudioPlaying:
      return {
        ...state,
        audioState: {
          ...state.audioState,
          playing: action.payload
        }
      };

    case CoreActionTypes.SetAudioLoading:
      return {
        ...state,
        audioState: {
          ...state.audioState,
          loading: action.payload
        }
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

export const getAudioInput = (state: State) => state.audioInput;
export const getAudioMuted = (state: State) => state.audioInput.muted;
export const getAudioVolume = (state: State) => state.audioInput.volume;

export const getAudioPlaying = (state: State) => state.audioState.playing;
export const getAudioLoading = (state: State) => state.audioState.loading;
export const getAudioDuration = (state: State) => state.audioState.duration;
