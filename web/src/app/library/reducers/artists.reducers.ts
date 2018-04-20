import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {Artist} from '@app/model';
import {ArtistsActionsUnion, ArtistsActionTypes} from '@app/library/actions/artists.actions';

/**
 * State
 */
export interface State extends EntityState<Artist> {
  selectedArtistsIds: string[];
}

export const adapter: EntityAdapter<Artist> = createEntityAdapter<Artist>({
  selectId: (artist: Artist) => artist.name,
  sortComparer: (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
});

export const initialState: State = adapter.getInitialState({
  selectedArtistsIds: []
});

/**
 * Reducer
 */
export function reducer(
  state = initialState,
  action: ArtistsActionsUnion
): State {
  switch (action.type) {

    case ArtistsActionTypes.LoadArtists:
      return adapter.addMany(action.payload, state);

    case ArtistsActionTypes.AddArtist:
      return adapter.addOne(action.payload, state);

    case ArtistsActionTypes.UpdateArtist: {
      return adapter.updateOne({
        id: action.payload.name,
        changes: action.payload
      }, state);
    }

    case ArtistsActionTypes.SelectArtist: {
      return {
        ...state,
        selectedArtistsIds: [...state.selectedArtistsIds, action.payload.name]
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
export const getSelectedArtistsIds = (state: State) => state.selectedArtistsIds;
