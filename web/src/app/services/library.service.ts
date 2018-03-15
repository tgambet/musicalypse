import { Injectable } from '@angular/core';
import {Album, Artist, Track} from '../model';
import * as _ from 'lodash';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

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

  tracks: Track[] = [];

  artists: Artist[] = [];

  albums: Album[] = [];

  playlist: Track[] = [];

  currentTrack: Track;

  trackPlayed: Observable<Track>;

  private trackPlayedSource = new Subject<Track>();

  constructor() {
    this.addTrack(this.a);
    this.trackPlayed = this.trackPlayedSource.asObservable();
  }

  addTrack(track: Track): void {
    if (!_.includes(this.tracks, track)) {
      this.tracks.push(track);
      const artist = track.metadata.artist;
      const album = track.metadata.album;
      const artistIndex = _.findIndex(this.artists, a => a.name === artist);
      const albumIndex = _.findIndex(this.albums, a => a.title === album);
      if (artistIndex === -1) {
        this.artists.push({name: artist, songs: 1});
      } else {
        this.artists[artistIndex].songs += 1;
      }
      if (albumIndex === -1) {
        this.albums.push({title: album, artist: artist, songs: 1});
      } else {
        this.albums[albumIndex].songs += 1;
      }
    }
  }

  addTrackToPlaylist(track: Track) {}

  addTracksToPlaylist(tracks: Track[]) {}

  resetPlaylist() {}

  playTrack(track: Track) {
    this.currentTrack = track;
    this.trackPlayedSource.next(track);
  }

  playTracks(tracks: Track[], next?: Track[]) {}

  playTrackNext(next: Track) {}

  playNextTrackInPlaylist() {}

  playPreviousTrackInPlaylist() {}

}
