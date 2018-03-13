import { Injectable } from '@angular/core';
import {Album, Artist, Track} from '../model';
import * as _ from 'lodash';

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
    if (!_.includes(this.tracks, track)) {
      this.tracks.push(track);
      const artist = track.metadata.artist;
      const album = track.metadata.album;
      const artistIndex = _.findIndex(this.artists, a => a.name === artist);
      const albumIndex = _.findIndex(this.albums, a => a.title === album);
      if (artistIndex === -1) {
        console.log('pushing artist');
        this.artists.push({name: artist, songs: 1});
      } else {
        this.artists[artistIndex].songs += 1;
      }
      if (albumIndex === -1) {
        console.log('pushing album ' + album);
        this.albums.push({title: album, artist: artist, songs: 1});
      } else {
        this.albums[albumIndex].songs += 1;
      }
    }
  }

}
