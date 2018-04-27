import {Set} from 'immutable';
import {Track} from '@app/model';
import {RecentActionsUnion, RecentActionTypes} from '@app/library/actions/recent.actions';
import * as _ from 'lodash';

export interface State {
  recentTracks: Set<Track>;
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
      action.payload
        .filter(track => !result.some(t => _.isEqual(t, track)))
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

export const getRecentTracks = (state: State) => state.recentTracks.toArray();


