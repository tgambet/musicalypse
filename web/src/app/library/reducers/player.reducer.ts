import {Track} from '@app/model';
import {List} from 'immutable';
import * as _ from 'lodash';

import {PlayerActionsUnion, PlayerActionTypes} from '@app/library/actions/player.actions';
import {PlaylistsActionTypes, PlaylistsActionUnion} from '@app/library/actions/playlists.actions';

export interface State {
  currentTrack: Track;
  repeat: boolean;
  shuffle: boolean;
  currentPlaylist: List<Track>;
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
      const track = action.payload;
      if (!playlist.some(t => _.isEqual(t, track))) {
        playlist = playlist.push(track);
      }
      return {
        ...state,
        currentTrack: track,
        currentPlaylist: playlist
      };
    }

    case PlayerActionTypes.PlayTrackNext: {
      const next = action.payload;
      const currentTrack = state.currentTrack;
      let playlist = state.currentPlaylist;
      const nextIndex = playlist.findIndex(t => _.isEqual(t, next));
      if (nextIndex > -1) {
        playlist = playlist.delete(nextIndex);
      }
      const currentIndex = playlist.findIndex(t => _.isEqual(t, currentTrack));
      playlist = playlist.splice(currentIndex + 1, 0, next);
      return {
        ...state,
        currentTrack: currentTrack ? currentTrack : next,
        currentPlaylist: playlist
      };
    }

    case PlayerActionTypes.AddToCurrentPlaylist: {
      let playlist: List<Track> = state.currentPlaylist;
      playlist = playlist.push(...action.payload.filter(track => !playlist.some(t => _.isEqual(t, track))));
      return {
        ...state,
        currentPlaylist: playlist
      };
    }

    case PlayerActionTypes.PlayNextTrack: {
      const playlist = state.currentPlaylist;
      const currentTrack = state.currentTrack;
      if (playlist.size === 0 || (playlist.findIndex(t => _.isEqual(t, currentTrack)) === playlist.size - 1) && !state.repeat) {
        return {
          ...state
        };
      }
      if (!currentTrack ||
          playlist.findIndex(t => _.isEqual(t, currentTrack)) === -1 ||
          (playlist.findIndex(t => _.isEqual(t, currentTrack)) === playlist.size - 1) && state.repeat) {
        return {
          ...state,
          currentTrack: playlist.get(0)
        };
      }
      return {
        ...state,
        currentTrack: playlist.get(playlist.findIndex(t => _.isEqual(t, currentTrack)) + 1)
      };
    }

    case PlayerActionTypes.PlayPreviousTrack: {
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
      if (shuffle) {
        let shuffled = List.of(..._.shuffle(state.currentPlaylist.toArray()));
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
          currentPlaylist: state.currentPlaylist.sortBy(t => t.url)
        };
      }
    }

    case PlayerActionTypes.SetCurrentPlaylist:
      return {
        ...state,
        currentPlaylist: List.of(...action.payload)
      };

    case PlaylistsActionTypes.LoadPlaylist: {
      return {
        ...state,
        currentPlaylist: List.of(...action.playlist.tracks),
        shuffle: false
      };
    }

    default: {
      return state;
    }
  }
}

export const getCurrentTrack = (state: State) => state.currentTrack;
export const getRepeat = (state: State) => state.repeat;
export const getShuffle = (state: State) => state.shuffle;
export const getCurrentPlaylist = (state: State) => state.currentPlaylist.toArray();
