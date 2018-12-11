import {ImmutableTrack, toImmutable, Track} from '@app/model';
import {is, List} from 'immutable';

import {PlayerActionsUnion, PlayerActionTypes} from '@app/library/actions/player.actions';
import {PlaylistsActionTypes, PlaylistsActionUnion} from '@app/library/actions/playlists.actions';
import {LibraryUtils} from '@app/library/library.utils';

export interface State {
  currentTrack: ImmutableTrack;
  repeat: boolean;
  shuffle: boolean;
  currentPlaylist: List<ImmutableTrack>;
}

export const initialState: State = {
  currentTrack: null,
  repeat: false,
  shuffle: false,
  currentPlaylist: List(),
};

export function reducer(
  state = initialState,
  action: PlayerActionsUnion | PlaylistsActionUnion // TODO use a side effect ?
): State {
  switch (action.type) {

    case PlayerActionTypes.SetCurrentTrack: {
      let playlist = state.currentPlaylist;
      const track = toImmutable(action.payload);
      if (is(track, state.currentTrack)) {
        return state; // don't change the state if not needed
      }
      if (!playlist.includes(track)) {
        playlist = playlist.push(track);
      }
      return {
        ...state,
        currentTrack: track,
        currentPlaylist: playlist
      };
    }

    case PlayerActionTypes.PlayTrackNext: {
      const next = toImmutable(action.payload);
      const currentTrack = state.currentTrack;
      let playlist = state.currentPlaylist;
      const nextIndex = playlist.indexOf(next);
      if (nextIndex > -1) {
        playlist = playlist.delete(nextIndex);
      }
      const currentIndex = playlist.indexOf(currentTrack);
      playlist = playlist.splice(currentIndex + 1, 0, next);
      return {
        ...state,
        currentTrack: currentTrack ? currentTrack : next,
        currentPlaylist: playlist
      };
    }

    case PlayerActionTypes.AddToCurrentPlaylist: {
      let playlist = state.currentPlaylist;
      const tracksToAdd = action.payload.map(toImmutable);
      playlist = playlist.push(...tracksToAdd.filter(track => !playlist.includes(track)));
      return {
        ...state,
        currentPlaylist: playlist
      };
    }

    case PlayerActionTypes.SetNextTrack: {
      const playlist = state.currentPlaylist;
      const currentTrack = state.currentTrack;
      if (playlist.size === 0 || is(playlist.last(), currentTrack) && !state.repeat) {
        return {
          ...state
        };
      }
      if (!currentTrack ||
          playlist.indexOf(currentTrack) === -1 ||
          is(playlist.last(), currentTrack) && state.repeat) {
        return {
          ...state,
          currentTrack: playlist.get(0)
        };
      }
      return {
        ...state,
        currentTrack: playlist.get(playlist.indexOf(currentTrack) + 1)
      };
    }

    case PlayerActionTypes.SetPreviousTrack: {
      const playlist = state.currentPlaylist;
      const currentTrack = state.currentTrack;
      if (playlist.size === 0) {
        return state;
      }
      if (!currentTrack ||
          !playlist.includes(currentTrack) ||
          playlist.indexOf(currentTrack) - 1 < 0) {
        return {
          ...state,
          currentTrack: playlist.get(playlist.size - 1)
        };
      }
      return {
        ...state,
        currentTrack: playlist.get(playlist.indexOf(currentTrack) - 1)
      };
    }

    case PlayerActionTypes.SetRepeat: {
      return {
        ...state,
        repeat: action.payload
      };
    }

    case PlayerActionTypes.SetShuffle: {
      const shuffle = action.payload;
      const playlist = state.currentPlaylist.toArray();
      if (shuffle) {
        let shuffled = List.of(...LibraryUtils.shuffleArray(playlist));
        if (shuffled.includes(state.currentTrack)) {
          shuffled = shuffled.delete(shuffled.indexOf(state.currentTrack));
          shuffled = shuffled.unshift(state.currentTrack);
        }
        return {
          ...state,
          shuffle: shuffle,
          currentPlaylist: shuffled
        };
      } else {
        return {
          ...state,
          shuffle: shuffle,
          currentPlaylist: state.currentPlaylist.sortBy(t => t.get('url'))
        };
      }
    }

    case PlayerActionTypes.SetCurrentPlaylist: {
      const playlist = action.payload.map(toImmutable);
      return {
        ...state,
        currentPlaylist: List.of(...playlist),
        shuffle: false
      };
    }

    case PlaylistsActionTypes.LoadPlaylist: {
      const playlist = action.playlist.tracks.map(toImmutable);
      return {
        ...state,
        currentPlaylist: List.of(...playlist),
        shuffle: false
      };
    }

    default: {
      return state;
    }
  }
}

export const getCurrentTrack = (state: State) => state.currentTrack && state.currentTrack.toJS() as Track;
export const getRepeat = (state: State) => state.repeat;
export const getShuffle = (state: State) => state.shuffle;
export const getCurrentPlaylist = (state: State) => state.currentPlaylist.toJS() as Track[];
