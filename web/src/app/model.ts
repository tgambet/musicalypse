
export interface Artist {
  name: string;
  songs: number;
  avatarUrl?: string;
  warn?: boolean;
}

export interface Album {
  artist: string;
  title: string;
  songs: number;
  avatarUrl?: string;
  warn?: boolean;
}

export interface Track {
  url: string;
  metadata: TrackMetadata;
  coverUrl?: string;
  warn?: boolean;
}

export interface TrackMetadata {
  location: string;
  title: string;
  album: string;
  artist: string;
  albumArtist: string;
  year: string;
  duration: number;
}
