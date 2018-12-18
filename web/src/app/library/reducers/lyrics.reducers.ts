import {LyricsActionsUnion, LyricsActionTypes} from '../actions/lyrics.actions';

export interface State {
  loading: boolean;
  lyrics: string;
  error: string;
  source: string;
}

export const initialState: State = {
  loading: false,
  lyrics: null,
  error: null,
  source: null
};

export function reducer(
  state = initialState,
  action: LyricsActionsUnion
): State {
  switch (action.type) {

    case LyricsActionTypes.LoadLyrics: {
      return {
        ...state,
        loading: true,
        lyrics: null,
        error: null,
        source: null
      };
    }

    case LyricsActionTypes.LoadLyricsSuccess: {
      return {
        ...state,
        loading: false,
        lyrics: action.lyrics,
        error: null,
        source: action.source
      };
    }

    case LyricsActionTypes.LoadLyricsFailure: {
      return {
        ...state,
        loading: false,
        lyrics: null,
        error: action.error,
        source: null
      };
    }

    default:
      return state;
  }
}

export const getLoading = (state: State) => state.loading;
export const getLyrics = (state: State) => state.lyrics;
export const getError = (state: State) => state.error;
export const getSource = (state: State) => state.source;


