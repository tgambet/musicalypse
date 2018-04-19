import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {Track} from '@app/model';
import {TracksActionsUnion, TracksActionTypes} from '@app/library/actions/tracks.actions';

/**
 * State
 */
export interface State extends EntityState<Track> {
  error: string;
}

export const adapter: EntityAdapter<Track> = createEntityAdapter<Track>({
  selectId: (track: Track) => track.url,
  sortComparer: false,
});

export const initialState: State = adapter.getInitialState({
  error: ''
});

/**
 * Reducer
 */
export function reducer(
  state = initialState,
  action: TracksActionsUnion
): State {
  switch (action.type) {

    case TracksActionTypes.AddTrack:
      return adapter.addOne(action.payload, state);

    case TracksActionTypes.RemoveTrack: {
      return adapter.removeOne(action.payload.url, state);
    }

    case TracksActionTypes.LoadTrackSuccess: {
      return adapter.addMany(action.payload, state);
    }

    case TracksActionTypes.LoadTrackFailure: {
      return {
        ...state,
        error: action.payload
      };
    }

    case TracksActionTypes.LoadTracks:

    default: {
      return state;
    }
  }
}

/**
 * Selectors
 */
export const getError = (state: State) => state.error;
