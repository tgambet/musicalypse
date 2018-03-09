
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
