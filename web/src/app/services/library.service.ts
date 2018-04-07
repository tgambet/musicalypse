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
  selectedArtists: Artist[] = [];
  selectedAlbums: Album[] = [];
  playlist: Track[] = [];
  oldPlaylist: Track[];

  repeat = false;
  shuffle = false;

  onArtistSelectionChanged: Observable<Artist[]>;
  onAlbumSelectionChanged: Observable<Album[]>;
  onTrackAdded: Observable<Track>;
  onTracksUpdated: Observable<void>;
  onReset: Observable<void>;

  private onArtistSelectionChangedSource = new Subject<Artist[]>();
  private onAlbumSelectionChangedSource = new Subject<Album[]>();
  private onTrackAddedSource = new Subject<Track>();
  private onTracksUpdatedSource = new Subject<void>();
  private onResetSource = new Subject<void>();

  constructor(
    private httpSocketClient: HttpSocketClientService,
    private titleService: Title
  ) {
    // this.addTrack(this.a);
    this.onArtistSelectionChanged = this.onArtistSelectionChangedSource.asObservable();
    this.onAlbumSelectionChanged = this.onAlbumSelectionChangedSource.asObservable();
    this.onTrackAdded = this.onTrackAddedSource.asObservable();
    this.onTracksUpdated = this.onTracksUpdatedSource.asObservable();
    this.onReset = this.onResetSource.asObservable();
  }

  static resolveUrl(sourceUrl: string) {
    if (environment.electron) {
      return 'http://localhost:' + environment.httpPort + encodeURI(sourceUrl);
    } else if (environment.production) {
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
    if (track.coverUrl) {
      track.coverUrl = LibraryService.resolveUrl(track.coverUrl);
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
        if (track.coverUrl) { newArtist.avatarUrl = track.coverUrl; }
        this.artists.push(newArtist);
      } else {
        if (track.warn) { this.artists[artistIndex].warn = true; }
        if (track.coverUrl) { this.artists[artistIndex].avatarUrl = track.coverUrl; }
        this.artists[artistIndex].songs += 1;
      }
      if (albumIndex === -1) {
        const newAlbum: Album = {title: album, artist: artist, songs: 1};
        if (track.warn) { newAlbum.warn = true; }
        if (track.coverUrl) { newAlbum.avatarUrl = track.coverUrl; }
        this.albums.push(newAlbum);
      } else {
        if (track.warn) { this.albums[albumIndex].warn = true; }
        if (track.coverUrl) { this.albums[albumIndex].avatarUrl = track.coverUrl; }
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
    this.selectedArtists = [];
    this.selectedAlbums = [];
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
    if (_.isEqual(artists, [])) {
      return [];
    }
    const artistsNames = _.map(artists, 'name');
    return _.filter(this.albums, (album: Album) => _.includes(artistsNames, album.artist));
  }

  getTracksOf(albums: Album[]): Track[] {
    if (_.isEqual(albums, [])) {
      return [];
    }
    return _.filter(this.tracks, track => {
      for (let i = 0; i < albums.length; i++) {
        if (albums[i].artist === track.metadata.albumArtist && albums[i].title === track.metadata.album) {
          return true;
        }
      }
      return false;
    });
  }

  isSelectedArtist(artist: Artist): boolean {
    return _.includes(this.selectedArtists, artist);
  }

  selectArtist(artist: Artist) {
    if (!_.isEqual(this.selectedArtists, [artist])) {
      this.selectedArtists = [artist];
      this.onArtistSelectionChangedSource.next([artist]);
    }
  }

  deselectArtist(artist: Artist) {
    if (_.includes(this.selectedArtists, artist)) {
      this.selectedArtists = _.filter(this.selectedArtists, a => a !== artist);
      this.onArtistSelectionChangedSource.next(this.selectedArtists);
    }
  }

  selectArtistsByName(names: string[]) {
    this.selectedArtists = _.filter(this.artists, artist => _.includes(names, artist.name));
    this.onArtistSelectionChangedSource.next(this.selectedArtists);
  }

  addArtist(artist: Artist) {
    if (!_.includes(this.selectedArtists, artist)) {
      this.selectedArtists.push(artist);
      this.onArtistSelectionChangedSource.next(this.selectedArtists);
    }
  }

  removeArtist(artist: Artist) {
    if (_.includes(this.selectedArtists, artist)) {
      _.remove(this.selectedArtists, a => a.name === artist.name);
      this.onArtistSelectionChangedSource.next(this.selectedArtists);
    }
  }

  selectAllArtists() {
    this.selectedArtists = _.clone(this.artists);
    this.onArtistSelectionChangedSource.next(this.selectedArtists);
  }

  deselectAllArtists() {
    if (this.selectedArtists === []) {
      return;
    } else {
      this.selectedArtists = [];
      this.onArtistSelectionChangedSource.next(this.selectedArtists);
    }
  }

  selectAlbum(album: Album) {
    if (!_.isEqual(this.selectedAlbums, [album])) {
      this.selectedAlbums = [album];
      this.onAlbumSelectionChangedSource.next([album]);
    }
  }

  deselectAlbum(album: Album) {
    if (_.includes(this.selectedAlbums, album)) {
      this.selectedAlbums = _.filter(this.selectedAlbums, a => a !== album);
      this.onAlbumSelectionChangedSource.next(this.selectedAlbums);
    }
  }

  selectAlbumsByName(names: string[]) {
    const oldSelection = this.selectedAlbums;
    this.selectedAlbums = _.filter(this.albums, album => _.includes(names, album.title));
    if (!_.isEqual(oldSelection, this.selectedAlbums)) {
      this.onAlbumSelectionChangedSource.next(this.selectedAlbums);
    }
  }

  addAlbum(album: Album) {
    if (!_.includes(this.selectedAlbums, album)) {
      this.selectedAlbums.push(album);
      this.onAlbumSelectionChangedSource.next(this.selectedAlbums);
    }
  }

  removeAlbum(album: Album) {
    if (_.includes(this.selectedAlbums, album)) {
      _.remove(this.selectedAlbums, a => a.title === album.title);
      this.onAlbumSelectionChangedSource.next(this.selectedAlbums);
    }
  }

  isSelectedAlbum(album: Album): boolean {
    return _.includes(this.selectedAlbums, album);
  }

  selectAllAlbums(albums: Album[]) {
    this.selectedAlbums = albums;
    this.onAlbumSelectionChangedSource.next(this.selectedAlbums);
  }

  deselectAllAlbums() {
    if (this.selectedAlbums === []) {
      return;
    } else {
      this.selectedAlbums = [];
      this.onAlbumSelectionChangedSource.next([]);
    }
  }

  filterSelectedAlbums(artists: Artist[]) {
    const oldSelection = _.clone(this.selectedAlbums);
    const artistsNames = _.map(artists, 'name');
    this.selectedAlbums = _.filter(this.selectedAlbums, album => _.includes(artistsNames, album.artist));
    if (!_.isEqual(oldSelection, this.selectedAlbums)) {
      this.onAlbumSelectionChangedSource.next(this.selectedAlbums);
    }
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
          this.onTracksUpdatedSource.next();
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
    this.audio.setSource(LibraryService.resolveUrl(track.url));
    window.setTimeout(() => this.audio.play(), 0);
  }

}
