
export interface Artist {
  name: string;
  songs: number;
}

export interface Album {
  artist: string;
  title: string;
  songs: number;
}

export interface SocketMessage {
  id: number;
  method: string;
  entity: any;
}

export interface Track {
  url: string;
  metadata: TrackMetadata;
}

export interface TrackMetadata {
  location: string;
  title: string;
  album: string;
  artist: string;
  duration: number;
}
