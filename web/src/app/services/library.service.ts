import { Injectable } from '@angular/core';
import {Album, Artist, Track} from '../model';

@Injectable()
export class LibraryService {

  a: Track = {
    url: '/music/Metallica - The Black Album/01 - Enter Sandman.mp3',
    metadata: {
      album: 'La Fête est Finie',
      artist: 'Orelsan',
      duration: 243,
      location: 'C:\\Users\\Thomas\\Workspace\\musicalypse\\web\\src\\assets\\music\\1 - San.mp3',
      title: 'San'
    }
  };

  tracks: Track[] = [this.a];

  artists: Artist[] = [];

  albums: Album[] = [];

  constructor() { }

  addTrack(track: Track): void {
    this.tracks.push(track);
  }

}
