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
      artist: 'Metallica',
      duration: 243,
      location: 'C:\\Users\\Thomas\\Workspace\\musicalypse\\web\\src\\assets\\music\\1 - San.mp3',
      title: 'San'
    }
  };

  tracks: Track[] = [];

  artists: Artist[] = [];

  albums: Album[] = [];

  playlist: Track[] = [];

  oldPlaylist: Track[];

  currentTrack: Track;

  repeat = false;

  shuffle = false;

  onTrackPlayed: Observable<Track>;
  onTrackAdded: Observable<Track>;

  private onTrackPlayedSource = new Subject<Track>();
  private onTrackAddedSource = new Subject<Track>();

  constructor() {
    this.addTrack(this.a);
    this.onTrackPlayed = this.onTrackPlayedSource.asObservable();
    this.onTrackAdded = this.onTrackAddedSource.asObservable();
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
    this.onTrackAddedSource.next(track);
  }

  addTrackToPlaylist(track: Track) {
    if (!_.includes(this.playlist, track)) {
      this.playlist.push(track);
    }
  }

  addTracksToPlaylist(tracks: Track[]) {
    _.forEach(tracks, track => this.addTrackToPlaylist(track));
  }

  resetPlaylist() {
    this.playlist = [];
    this.oldPlaylist = null;
  }

  playTrack(track: Track) {
    this.currentTrack = track;
    this.onTrackPlayedSource.next(track);
  }

  playTracks(tracks: Track[], next?: Track) {
    this.playlist = tracks;
    this.currentTrack = next ? next : this.playlist[0];
    if (this.shuffle) {
      this.shufflePlaylist();
    }
    this.onTrackPlayedSource.next(this.currentTrack);
  }

  playTrackNext(next: Track) {
    // if current track isn't set or in playlist and next isn't in playlist
    if ((!this.currentTrack || !_.includes(this.playlist, this.currentTrack)) && !_.includes(this.playlist, next)) {
      this.playlist.splice(0, 0, next);
    } else {
      // remove next from playlist if present
      if (_.includes(this.playlist, next)) {
        _.remove(this.playlist, next);
      }
      // find index of currentTrack
      const currentTrackIndex = _.indexOf(this.playlist, this.currentTrack);
      // insert next at the correct index
      this.playlist.splice(currentTrackIndex + 1, 0, next);
    }
    if (!this.currentTrack) {
      this.playTrack(next);
    }
  }

  playNextTrackInPlaylist() {
    if (this.playlist.length === 0) {
      return;
    }
    if (!this.currentTrack) {
      this.playTrack(this.playlist[0]);
      return;
    }
    const currentTrackIndex = _.indexOf(this.playlist, this.currentTrack);
    if (this.playlist[currentTrackIndex + 1]) {
      this.playTrack(this.playlist[currentTrackIndex + 1]);
    } else if (currentTrackIndex + 1 >= this.playlist.length) {
      this.playTrack(this.playlist[0]);
    }
  }

  playPreviousTrackInPlaylist() {
    if (this.playlist.length === 0) {
      return;
    }
    if (!this.currentTrack) {
      this.playTrack(this.playlist[this.playlist.length - 1]);
    }
    const currentTrackIndex = _.indexOf(this.playlist, this.currentTrack);
    if (this.playlist[currentTrackIndex - 1]) {
      this.playTrack(this.playlist[currentTrackIndex - 1]);
    } else if (currentTrackIndex - 1 <= 0) {
      this.playTrack(this.playlist[this.playlist.length - 1]);
    }
  }

  shufflePlaylist() {
    this.oldPlaylist = this.playlist;
    this.playlist = _.shuffle(this.playlist);
    if (this.currentTrack && _.includes(this.playlist, this.currentTrack)) {
      _.remove(this.playlist, this.currentTrack);
      this.playlist.splice(0, 0, this.currentTrack);
    }
    this.shuffle = true;
  }

  unShufflePlaylist() {
    if (this.oldPlaylist) {
      this.playlist = this.oldPlaylist;
      this.oldPlaylist = null;
    }
    this.shuffle = false;
  }

  isCurrentTrackLastInPlaylist(): boolean {
    return _.indexOf(this.playlist, this.currentTrack) === this.playlist.length - 1;
  }

  getAlbumsOf(artists: Artist[]): Album[] {
    const artistsNames = _.map(artists, 'name');
    return _.filter(this.albums, album => _.includes(artistsNames, album.artist));
  }

  getTracksOf(albums: Album[]): Track[] {
    // TODO check this in case two artists have the same album value (e.g. Unknown Album or '')
    const albumTitles = _.map(albums, 'title');
    return _.filter(this.tracks, track => _.includes(albumTitles, track.metadata.album));
  }

}
