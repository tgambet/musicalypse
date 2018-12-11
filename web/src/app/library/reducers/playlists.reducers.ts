import {List} from 'immutable';

import {ImmutablePlaylist, Playlist, toImmutable} from '@app/model';
import {PlaylistsActionTypes, PlaylistsActionUnion} from '@app/library/actions/playlists.actions';

export interface State {
  playlists: List<ImmutablePlaylist>;
}

export const initialState: State = {
  playlists: List(),
};

export function reducer(
  state = initialState,
  action: PlaylistsActionUnion
): State {
  switch (action.type) {

    case PlaylistsActionTypes.AddToPlaylist: {
      const playlistIndex = state.playlists.findIndex(p => p.get('name') === action.playlistName);
      if (playlistIndex === -1) {
        return {
          ...state,
          playlists: state.playlists.push(toImmutable({name: action.playlistName, tracks: action.tracks}))
        };
      } else {
        const playlist = state.playlists.get(playlistIndex);
        return {
          ...state,
          playlists: state.playlists.set(
            playlistIndex,
            playlist.set('tracks', playlist.get('tracks').union(action.tracks))
          )
        };
      }
    }

    case PlaylistsActionTypes.RemoveFromPlaylist: {
      const playlist = state.playlists.find(p => p.get('name') === action.playlistName);
      return {
        ...state,
        playlists: state.playlists.set(
          state.playlists.indexOf(playlist),
          playlist.set('tracks', playlist.get('tracks').delete(action.track))
        )
      };
    }

    case PlaylistsActionTypes.LoadPlaylists: {
      const playlists = action.playlists.map(toImmutable);
      return {
        ...state,
        playlists: List.of(...playlists)
      };
    }

    case PlaylistsActionTypes.SavePlaylist: {
      const playlist = state.playlists.find(p => p.get('name') === action.name);
      const playlists = playlist ?
        state.playlists.set(state.playlists.indexOf(playlist), toImmutable({name: action.name, tracks: action.tracks})) :
        state.playlists.push(toImmutable({name: action.name, tracks: action.tracks}));
      return {
        ...state,
        playlists: playlists
      };
    }

    case PlaylistsActionTypes.DeletePlaylist: {
      const index = state.playlists.findIndex(p => p.get('name') === action.name);
      const playlists = index > -1 ? state.playlists.remove(index) : state.playlists;
      return {
        ...state,
        playlists: playlists
      };
    }

    default: {
      return state;
    }
  }
}

export const getPlaylists = (state: State) => state.playlists.toJS() as Playlist[];
