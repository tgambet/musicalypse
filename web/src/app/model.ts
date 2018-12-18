import {fromJS, Map, Set} from 'immutable';

// https://stackoverflow.com/questions/43607652/typescript-immutable-proper-way-of-extending-immutable-map-type

interface ImmutableMap<T> extends Map<string, any> {}

export function toImmutable<T extends object> (o: T) {
  return fromJS(o) as ImmutableMap<T>;
}

export interface Track {
  url: string;
  coverUrl?: string;
  location: string;
  title: string;
  album: string;
  artist: string;
  albumArtist: string;
  year: string;
  duration: number;
  // warn?: boolean;
}

export type ImmutableTrack = ImmutableMap<Track>;

export interface Artist {
  name: string;
  songs: number;
  avatarUrl?: string;
  // warn?: boolean;
}

export interface Album {
  artist: string;
  title: string;
  songs: number;
  avatarUrl?: string;
  // warn?: boolean;
}

export interface Playlist {
  name: string;
  tracks: Track[];
}

export type ImmutablePlaylist = ImmutableMap<{
  name: string;
  tracks: Set<Track>;
}>;

export interface LyricsOptions {
  useService: boolean;
  services: {
    wikia: boolean;
    lyricsOvh: boolean;
  };
  automaticSave: boolean;
}
