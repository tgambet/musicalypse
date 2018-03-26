export interface SocketMessage {
  id: number;
  method: string;
  entity: any;
}

export interface Artist {
  name: string;
  songs: number;
  warn?: boolean;
}

export interface Album {
  artist: string;
  title: string;
  songs: number;
  warn?: boolean;
}

export interface Track {
  url: string;
  metadata: TrackMetadata;
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
