import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {Track} from '@app/model';
import {TracksActionsUnion, TracksActionTypes} from '@app/library/actions/tracks.actions';

/**
 * State
 */
export interface State extends EntityState<Track> {
  error: string;
  loading: boolean;
}

export const adapter: EntityAdapter<Track> = createEntityAdapter<Track>({
  selectId: (track: Track) => track.url,
  sortComparer: (a, b) => a.url.localeCompare(b.url),
});

export const initialState: State = adapter.getInitialState({
  error: '',
  loading: false
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

    case TracksActionTypes.AddTracks:
      return adapter.addMany(action.payload, state);

    case TracksActionTypes.RemoveTrack: {
      return adapter.removeOne(action.payload.url, state);
    }

    case TracksActionTypes.LoadTracksSuccess: {
      return adapter.addMany(action.payload, {
        ...state,
        loading: false
      });
    }

    case TracksActionTypes.LoadTracksFailure: {
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    }

    case TracksActionTypes.ScanTracks:
      return adapter.removeAll(state);

    case TracksActionTypes.LoadTracks: {
      return {
        ...state,
        loading: true
      };
    }

    default: {
      return state;
    }
  }
}

/**
 * Selectors
 */
export const getError = (state: State) => state.error;
export const getLoading = (state: State) => state.loading;
