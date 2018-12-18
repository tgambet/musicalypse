import {SettingsActionsUnion, SettingsActionTypes} from '../settings.actions';
import {LyricsOptions} from '@app/model';

/**
 * State
 */
export interface State extends LyricsOptions {
  useService: boolean;
  services: {
    wikia: boolean;
    lyricsOvh: boolean;
  };
  automaticSave: boolean;
}

const initialState: State = {
  useService: true,
  services: {
    wikia: true,
    lyricsOvh: true
  },
  automaticSave: true
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
        ...action.payload
      };

    default:
      return state;
  }
}

/**
 * Selectors
 */
export const getLyricsOptions = (state: State) => state;
