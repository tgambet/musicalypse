import {Injectable} from '@angular/core';
import {Album, Artist, Track} from '../model';
import {environment} from '../../environments/environment';
import * as _ from 'lodash';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {AudioComponent} from '../library/audio/audio.component';

@Injectable()
export class LibraryService {

  a: Track = {
    url: '/music/404.mp3',
    metadata: {
      album: 'Some Album',
      artist: 'Some Artists',
      albumArtist: 'Some Artist',
      year: '2018',
      duration: 120,
      location: '/some/path',
      title: 'Some Title'
    }
  };

  audio: AudioComponent;

  currentTrack: Track;
  tracks: Track[] = [];
  artists: Artist[] = [];
  albums: Album[] = [];
  playlist: Track[] = [];
  oldPlaylist: Track[];

  repeat = false;
  shuffle = false;

  onTrackAdded: Observable<Track>;
  onReset: Observable<void>;

  private onTrackAddedSource = new Subject<Track>();
  private onResetSource = new Subject<void>();

  constructor() {
    this.addTrack(this.a);
    this.onTrackAdded = this.onTrackAddedSource.asObservable();
    this.onReset = this.onResetSource.asObservable();
  }

  static getAudioUrl(sourceUrl: string) {
    if (environment.production) {
      return encodeURI(sourceUrl);
    } else {
      return `${window.location.protocol}//${window.location.hostname}:${environment.httpPort}${encodeURI(sourceUrl)}`;
    }
  }

  setAudioComponent(audioComponent: AudioComponent) {
    if (this.audio) {
      throw Error('AudioComponent already set!');
    }
    this.audio = audioComponent;
    this.audio.onPlayEnd.asObservable().subscribe(
      () => {
        if (this.playlist.length > 0 && (this.repeat || !this.isCurrentTrackLastInPlaylist())) {
          this.playNextTrackInPlaylist();
        } else {
          this.currentTrack = null;
          this.audio.setSource('');
        }
      }
    );
  }

  addTrack(track: Track): void {
    if (!_.includes(this.tracks, track)) {
      this.tracks.push(track);
      const artist = track.metadata.albumArtist;
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

  reset() {
    this.tracks = [];
    this.albums = [];
    this.artists = [];
    this.playlist = [];
    this.onResetSource.next();
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
    this._playTrack(track);
  }

  playTracks(tracks: Track[], next?: Track) {
    this.playlist = tracks;
    this.currentTrack = next ? next : this.playlist[0];
    if (this.shuffle) {
      this.shufflePlaylist();
    }
    this._playTrack(this.currentTrack);
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

  private _playTrack(track: Track) {
    this.audio.setSource(LibraryService.getAudioUrl(track.url));
    window.setTimeout(() => this.audio.play(), 0);
  }

}
