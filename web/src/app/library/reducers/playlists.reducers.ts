import {Playlist} from '@app/model';
import {List} from 'immutable';
import {PlaylistsActionTypes, PlaylistsActionUnion} from '@app/library/actions/playlists.actions';
import * as _ from 'lodash';

export interface State {
  playlists: List<Playlist>;
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
      const playlist = state.playlists.find(p => p.name === action.playlist);
      return {
        ...state,
        playlists: state.playlists.set(
          state.playlists.indexOf(playlist),
          {
            name: playlist.name,
            tracks: [...playlist.tracks, action.track]
          }
        )
      };
    }

    case PlaylistsActionTypes.RemoveFromPlaylist: {
      const playlist = state.playlists.find(p => p.name === action.playlist);
      return {
        ...state,
        playlists: state.playlists.set(
          state.playlists.indexOf(playlist),
          {
            name: playlist.name,
            tracks: playlist.tracks.filter(t => !_.isEqual(t, action.track))
          }
        )
      };
    }

    case PlaylistsActionTypes.LoadPlaylist: {
      return state;
    }

    case PlaylistsActionTypes.SavePlaylist: {
      const playlist = state.playlists.find(p => p.name === action.name);
      const playlists = playlist ?
        state.playlists.set(state.playlists.indexOf(playlist), {name: action.name, tracks: action.tracks}) :
        state.playlists.push({name: action.name, tracks: action.tracks});
      return {
        ...state,
        playlists: playlists
      };
    }

    case PlaylistsActionTypes.DeletePlaylist: {
      const playlist = state.playlists.find(p => p.name === action.name);
      const playlists = playlist ?
        state.playlists.remove(state.playlists.findIndex(p => p.name === action.name)) :
        state.playlists;
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

export const getPlaylists = (state: State) => state.playlists.toArray();
