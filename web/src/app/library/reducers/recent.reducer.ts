import {Set} from 'immutable';
import {ImmutableTrack, toImmutable, Track} from '@app/model';
import {RecentActionsUnion, RecentActionTypes} from '@app/library/actions/recent.actions';

export interface State {
  recentTracks: Set<ImmutableTrack>;
}

export const initialState: State = {
  recentTracks: Set()
};

export function reducer(
  state = initialState,
  action: RecentActionsUnion
): State {
  switch (action.type) {

    case RecentActionTypes.AddToRecent: {
      let result = state.recentTracks;
      toImmutable(action.payload)
        .filter(track => !result.contains(track))
        .forEach(track => result = result.add(track));
      if (result.size > 50) {
        result = result.slice(1, result.size);
      }
      return {
        ...state,
        recentTracks: result
      };
    }

    default:
      return state;
  }
}

export const getRecentTracks = (state: State) => state.recentTracks.toJS() as Track[];


