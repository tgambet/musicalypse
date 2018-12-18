import {LyricsActionsUnion, LyricsActionTypes} from '../actions/lyrics.actions';

export interface State {
  loading: boolean;
}

export const initialState: State = {
  loading: false
};

export function reducer(
  state = initialState,
  action: LyricsActionsUnion
): State {
  switch (action.type) {

    case LyricsActionTypes.SetLyricsLoading: {
      return {
        ...state,
        loading: action.payload
      };
    }

    default:
      return state;
  }
}

export const getLoading = (state: State) => state.loading;


