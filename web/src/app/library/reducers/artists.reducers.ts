import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {Artist} from '@app/model';
import {ArtistsActionsUnion, ArtistsActionTypes} from '@app/library/actions/artists.actions';
import {TracksActionsUnion, TracksActionTypes} from '@app/library/actions/tracks.actions';
import {LibraryUtils} from '@app/library/library.utils';
import * as _ from 'lodash';

/**
 * State
 */
export interface State extends EntityState<Artist> {
  selectedIds: (string | number)[];
}

export const adapter: EntityAdapter<Artist> = createEntityAdapter<Artist>({
  selectId: (artist: Artist) => artist.name,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export const initialState: State = adapter.getInitialState({
  selectedIds: []
});

/**
 * Reducer
 */
export function reducer(
  state = initialState,
  action: ArtistsActionsUnion | TracksActionsUnion
): State {
  switch (action.type) {

    case ArtistsActionTypes.LoadArtists:
      return adapter.upsertMany(action.payload, state);

    case ArtistsActionTypes.DeselectAllArtists: {
      return {
        ...state,
        selectedIds: []
      };
    }

    case ArtistsActionTypes.SelectArtist: {
      if (state.selectedIds.indexOf(action.payload.name) === -1) {
        return {
          ...state,
          selectedIds: [...state.selectedIds, action.payload.name]
        };
      } else {
        return state;
      }
    }

    case ArtistsActionTypes.DeselectArtist: {
      return {
        ...state,
        selectedIds: state.selectedIds.filter(id => id !== action.payload.name)
      };
    }

    case ArtistsActionTypes.SelectArtists: {
      return {
        ...state,
        selectedIds: action.payload.map(a => a.name)
      };
    }

    case ArtistsActionTypes.SelectArtistsByIds: {
      return {
        ...state,
        selectedIds: action.payload
      };
    }

    case TracksActionTypes.ScanTracks:
      return adapter.removeAll({
        ...state,
        selectedIds: []
      });

    case TracksActionTypes.LoadTracksSuccess: {
      const artists = LibraryUtils.extractArtists(action.payload);
      return adapter.upsertMany(artists, state);
    }

    case TracksActionTypes.AddTracks: {
      const artists = LibraryUtils.extractArtists(action.payload);
      artists.map(artist => {
        const old = state.entities[artist.name];
        if (old) {
          artist.songs += old.songs;
        }
        return artist;
      });
      return adapter.upsertMany(artists, state);
    }

    case TracksActionTypes.RemoveTracks: {
      const artists = LibraryUtils.extractArtists(action.payload);
      const fn: (s: State, artist: Artist) => State = (s, artist) => {
        const old = s.entities[artist.name];
        if (old) {
          old.songs -= artist.songs;
          if (old.songs === 0) {
            return adapter.removeOne(old.name, s);
          } else {
            return adapter.upsertOne(old, s);
          }
        }
      };
      return _.reduce(artists, fn, state);
    }

    default: {
      return state;
    }
  }
}

/**
 * Selectors
 */
export const getSelectedIds = (state: State) => state.selectedIds;
