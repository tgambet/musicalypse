/**
 * State
 */
import {AudioActionsUnion, AudioActionTypes} from '@app/core/actions/audio.actions';

export interface State {
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
  action: AudioActionsUnion
): State {
  switch (action.type) {

    case AudioActionTypes.SetAudioSource:
      return {
        ...state,
        audioInput: {
          ...state.audioInput,
          source: action.payload
        }
      };

    case AudioActionTypes.SetAudioVolume:
      return {
        ...state,
        audioInput: {
          ...state.audioInput,
          volume: action.payload
        }
      };

    case AudioActionTypes.SetAudioMuted:
      return {
        ...state,
        audioInput: {
          ...state.audioInput,
          muted: action.payload
        }
      };

    case AudioActionTypes.SetAudioDuration:
      return {
        ...state,
        audioState: {
          ...state.audioState,
          duration: action.payload
        }
      };

    case AudioActionTypes.SetAudioError:
      return {
        ...state,
        audioState: {
          ...state.audioState,
          error: action.payload
        }
      };

    case AudioActionTypes.SetAudioPlaying:
      return {
        ...state,
        audioState: {
          ...state.audioState,
          playing: action.payload
        }
      };

    case AudioActionTypes.SetAudioLoading:
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
export const getAudioInput = (state: State) => state.audioInput;
export const getAudioMuted = (state: State) => state.audioInput.muted;
export const getAudioVolume = (state: State) => state.audioInput.volume;

export const getAudioPlaying = (state: State) => state.audioState.playing;
export const getAudioLoading = (state: State) => state.audioState.loading;
export const getAudioDuration = (state: State) => state.audioState.duration;
