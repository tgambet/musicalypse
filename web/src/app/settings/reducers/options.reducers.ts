import {SettingsActionsUnion, SettingsActionTypes} from '../settings.actions';
import {LyricsOptions} from '@app/model';

/**
 * State
 */
export interface State {
  lyricsOptions: LyricsOptions;
}

const initialState: State = {
  lyricsOptions: {
    useService: true,
    services: {
      wikia: true,
      lyricsOvh: true
    },
    automaticSave: true
  }
};

/**
 * Reducer
 */
export function reducer(
  state: State = initialState,
  action: SettingsActionsUnion
): State {
  switch (action.type) {

    case SettingsActionTypes.SetLyricsOptions:
      return {
        ...state,
        lyricsOptions: {
          ...action.payload
        },
      };

    default:
      return state;
  }
}

/**
 * Selectors
 */
export const getLyricsOptions = (state: State) => state.lyricsOptions;
