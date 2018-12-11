import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {ImmutableTrack, toImmutable} from '@app/model';
import {TracksActionsUnion, TracksActionTypes} from '@app/library/actions/tracks.actions';

/**
 * State
 */
export interface State extends EntityState<ImmutableTrack> {
  error: string;
  loading: boolean;
}

export const adapter: EntityAdapter<ImmutableTrack> = createEntityAdapter<ImmutableTrack>({
  selectId: (track: ImmutableTrack) => track.get('url'),
  sortComparer: (a, b) => a.get('url').localeCompare(b.get('url')),
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

    case TracksActionTypes.AddTracks:
      return adapter.addMany(action.payload.map(toImmutable), state);

    case TracksActionTypes.RemoveTracks: {
      return adapter.removeMany(action.payload.map(t => t.url), state);
    }

    case TracksActionTypes.LoadTracksSuccess: {
      return adapter.addMany(action.payload.map(toImmutable), {
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
        loading: true,
        error: ''
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
