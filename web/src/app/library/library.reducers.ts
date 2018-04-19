import {ActionReducerMap, createFeatureSelector, createSelector} from '@ngrx/store';

import * as fromTracks from './reducers/tracks.reducers';
import * as fromRoot from '@app/reducers';

export interface TracksState {
  tracks: fromTracks.State;
}

export interface State extends fromRoot.State {
  library: TracksState;
}

export const reducers: ActionReducerMap<TracksState> = {
  tracks: fromTracks.reducer
};

export const getLibraryState = createFeatureSelector<TracksState>('library');

export const getTracksState = createSelector(
  getLibraryState,
  state => state.tracks
);

export const getTracksError = createSelector(
  getTracksState,
  fromTracks.getError
);

export const {
  selectIds: getTrackIds,
  selectEntities: getTrackEntities,
  selectAll: getAllTracks,
  selectTotal: getTotalTracks,
} = fromTracks.adapter.getSelectors(getTracksState);

