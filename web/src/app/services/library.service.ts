import {Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Album, Artist, SocketMessage, Track} from '../model';
import {environment} from '../../environments/environment';
import {AudioComponent} from '../audio/audio.component';
import {HttpSocketClientService} from './http-socket-client.service';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import * as _ from 'lodash';

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

  constructor(
    private httpSocketClient: HttpSocketClientService,
    private titleService: Title
  ) {
    // this.addTrack(this.a);
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
    if (track.metadata.title === undefined || track.metadata.title === '') {
      const components = track.url.split('/');
      track.metadata.title = components[components.length - 1];
      track.warn = true;
    }
    if (track.metadata.albumArtist === undefined || track.metadata.albumArtist === '') {
      track.metadata.albumArtist = track.metadata.artist || 'Unknown Album Artist';
      track.warn = true;
    }
    if (track.metadata.artist === undefined || track.metadata.artist === '') {
      track.metadata.artist = 'Unknown Artist';
      track.warn = true;
    }
    if (track.metadata.album === undefined || track.metadata.album === '') {
      track.metadata.album = 'Unknown Album';
      track.warn = true;
    }
    if (!_.includes(_.map(this.tracks, t => t.url), track.url)) {
      this.tracks.push(track);
      const artist = track.metadata.albumArtist;
      const album = track.metadata.album;
      const artistIndex = _.findIndex(this.artists, a => a.name === artist);
      const albumIndex = _.findIndex(this.albums, a => a.title === album && a.artist === artist);
      if (artistIndex === -1) {
        const newArtist: Artist = {name: artist, songs: 1};
        if (track.warn) { newArtist.warn = true; }
        this.artists.push(newArtist);
      } else {
        if (track.warn) { this.artists[artistIndex].warn = true; }
        this.artists[artistIndex].songs += 1;
      }
      if (albumIndex === -1) {
        const newAlbum: Album = {title: album, artist: artist, songs: 1};
        if (track.warn) { newAlbum.warn = true; }
        this.albums.push(newAlbum);
      } else {
        if (track.warn) { this.albums[albumIndex].warn = true; }
        this.albums[albumIndex].songs += 1;
      }
    }
    this.onTrackAddedSource.next(track);
  }

  reset() {
    this.repeat = false;
    this.shuffle = false;
    this.tracks = [];
    this.albums = [];
    this.artists = [];
    this.playlist = [];
    this.oldPlaylist = null;
    this.currentTrack = null;
    this.audio.setSource('');
    this.onResetSource.next();
  }

  addTrackToPlaylist(track: Track) {
    if (!_.includes(this.playlist, track)) {
      this.playlist.push(track);
    }
    if (this.shuffle && !_.includes(this.oldPlaylist, track)) {
      this.oldPlaylist.push(track);
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
    this.addTrackToPlaylist(track);
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
    return _.filter(this.albums, (album: Album) => _.includes(artistsNames, album.artist));
  }

  getTracksOf(albums: Album[]): Track[] {
    return _.filter(this.tracks, track => {
      for (let i = 0; i < albums.length; i++) {
        if (albums[i].artist === track.metadata.albumArtist && albums[i].title === track.metadata.album) {
          return true;
        }
      }
      return false;
    });
  }

  scanLibrary(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.reset();
      const currentId = ++this.httpSocketClient.id;
      const subscription1 = this.httpSocketClient
        .openSocket()
        .filter((r: SocketMessage) => r.method === 'TrackAdded' && r.id === currentId)
        .map((r: SocketMessage) => r.entity)
        .map((e: Track) => e)
        .subscribe(
          track => this.addTrack(track),
          error => reject(error)
        );

      const subscription2 = this.httpSocketClient
        .openSocket()
        .filter((r: SocketMessage) => r.method === 'LibraryScanned' && r.id === currentId)
        .take(1)
        .subscribe(() => {
          subscription1.unsubscribe();
          subscription3.unsubscribe();
          resolve();
        });

      const subscription3 = this.httpSocketClient
        .openSocket()
        .filter((r: SocketMessage) => r.method === 'LibraryScannedFailed' && r.id === currentId)
        .take(1)
        .subscribe(error => {
          subscription1.unsubscribe();
          subscription2.unsubscribe();
          reject(error);
        });

      this.httpSocketClient.send({method: 'ScanLibrary', id: currentId, entity: null});
    });
  }

  updateTracks(): Promise<void> {
    // this.reset();
    return new Promise((resolve, reject) => {
      this.httpSocketClient.get('/api/libraries/tracks').subscribe(
        (tracks: Track[]) => {
          _.forEach(tracks, track => this.addTrack(track));
          resolve();
        },
        (error) => {
          reject(error);
        }
      );
    });

  }

  private _playTrack(track: Track) {
    this.titleService.setTitle(`Musicalypse • ${track.metadata.artist} - ${track.metadata.title}`);
    this.audio.setSource(LibraryService.getAudioUrl(track.url));
    window.setTimeout(() => this.audio.play(), 0);
  }

}
