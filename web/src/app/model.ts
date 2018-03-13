
export interface Artist {

  id: string;

  name: string;

  songsNumber: number;

}

export interface Album {

  id: string;

  artistId: string;

  name: string;

  songsNumber: number;

}

export interface Track {

  id: string;

  albumId: String;

  artistId: string;

  name: string;

  duration: number;

  source: string;

}

export interface SocketMessage {
  id: number;
  method: string;
  entity: any;
}

export interface Track1 {
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
