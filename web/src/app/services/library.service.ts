import {Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Album, Artist, Track} from '../model';
import {environment} from '../../environments/environment';
import {AudioComponent} from '../audio/audio.component';
import {HttpSocketClientService, SocketMessage} from './http-socket-client.service';
import {LoaderService} from './loader.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/publishLast';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import * as _ from 'lodash';

@Injectable()
export class LibraryService {

  audio: AudioComponent;

  currentTrack: Track;

  selectedArtists: Artist[] = [];
  selectedAlbums: Album[] = [];

  playlist: Track[] = [];
  oldPlaylist: Track[];

  repeat = false;
  shuffle = false;

  tracksObs:  Observable<Track[]>  = Observable.empty();
  artistsObs: Observable<Artist[]> = Observable.empty();
  albumsObs:  Observable<Album[]>  = Observable.empty();

  constructor(
    private httpSocketClient: HttpSocketClientService,
    private titleService: Title,
    private loader: LoaderService
  ) {
    this.update();
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

  private static fixTags(track: Track): Track {
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
    return track;
  }

  private static extractArtists(tracks: Track[]): Artist[] {
    const artists: Artist[] = [];
    _.forEach(tracks, track => {
      const artist = track.metadata.albumArtist;
      const artistIndex = _.findIndex(artists, a => a.name === artist);
      if (artistIndex === -1) {
        const newArtist: Artist = {name: artist, songs: 1};
        if (track.warn) { newArtist.warn = true; }
        if (track.coverUrl) { newArtist.avatarUrl = track.coverUrl; }
        artists.push(newArtist);
      } else {
        if (track.warn) { artists[artistIndex].warn = true; }
        if (track.coverUrl) { artists[artistIndex].avatarUrl = track.coverUrl; }
        artists[artistIndex].songs += 1;
      }
    });
    return artists;
  }

  private static extractAlbums(tracks: Track[]): Album[] {
    const albums: Album[] = [];
    _.forEach(tracks, track => {
      const artist = track.metadata.albumArtist;
      const album = track.metadata.album;
      const albumIndex = _.findIndex(albums, a => a.title === album && a.artist === artist);
      if (albumIndex === -1) {
        const newAlbum: Album = {title: album, artist: artist, songs: 1};
        if (track.warn) { newAlbum.warn = true; }
        if (track.coverUrl) { newAlbum.avatarUrl = track.coverUrl; }
        albums.push(newAlbum);
      } else {
        if (track.warn) { albums[albumIndex].warn = true; }
        if (track.coverUrl) { albums[albumIndex].avatarUrl = track.coverUrl; }
        albums[albumIndex].songs += 1;
      }
    });
    return albums;
  }

  scan() {
    this.tracksObs  = this.scanTracks();
    this.artistsObs = this.tracksObs.map(tracks => LibraryService.extractArtists(tracks));
    this.albumsObs  = this.tracksObs.map(tracks => LibraryService.extractAlbums(tracks));
  }

  update() {
    this.tracksObs  = this.updateTracks();
    this.artistsObs = this.tracksObs.map(tracks => LibraryService.extractArtists(tracks));
    this.albumsObs  = this.tracksObs.map(tracks => LibraryService.extractAlbums(tracks));
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

  // addTrack(track: Track): void {
  //   if (track.metadata.title === undefined || track.metadata.title === '') {
  //     const components = track.url.split('/');
  //     track.metadata.title = components[components.length - 1];
  //     track.warn = true;
  //   }
  //   if (track.metadata.albumArtist === undefined || track.metadata.albumArtist === '') {
  //     track.metadata.albumArtist = track.metadata.artist || 'Unknown Album Artist';
  //     track.warn = true;
  //   }
  //   if (track.metadata.artist === undefined || track.metadata.artist === '') {
  //     track.metadata.artist = 'Unknown Artist';
  //     track.warn = true;
  //   }
  //   if (track.metadata.album === undefined || track.metadata.album === '') {
  //     track.metadata.album = 'Unknown Album';
  //     track.warn = true;
  //   }
  //   if (track.coverUrl) {
  //     track.coverUrl = LibraryService.resolveUrl(track.coverUrl);
  //   }
  //   if (!_.includes(_.map(this.tracks, t => t.url), track.url)) {
  //     this.tracks.push(track);
  //     const artist = track.metadata.albumArtist;
  //     const album = track.metadata.album;
  //     const artistIndex = _.findIndex(this.artists, a => a.name === artist);
  //     const albumIndex = _.findIndex(this.albums, a => a.title === album && a.artist === artist);
  //     if (artistIndex === -1) {
  //       const newArtist: Artist = {name: artist, songs: 1};
  //       if (track.warn) { newArtist.warn = true; }
  //       if (track.coverUrl) { newArtist.avatarUrl = track.coverUrl; }
  //       this.artists.push(newArtist);
  //     } else {
  //       if (track.warn) { this.artists[artistIndex].warn = true; }
  //       if (track.coverUrl) { this.artists[artistIndex].avatarUrl = track.coverUrl; }
  //       this.artists[artistIndex].songs += 1;
  //     }
  //     if (albumIndex === -1) {
  //       const newAlbum: Album = {title: album, artist: artist, songs: 1};
  //       if (track.warn) { newAlbum.warn = true; }
  //       if (track.coverUrl) { newAlbum.avatarUrl = track.coverUrl; }
  //       this.albums.push(newAlbum);
  //     } else {
  //       if (track.warn) { this.albums[albumIndex].warn = true; }
  //       if (track.coverUrl) { this.albums[albumIndex].avatarUrl = track.coverUrl; }
  //       this.albums[albumIndex].songs += 1;
  //     }
  //   }
  //   this.onTrackAddedSource.next(track);
  // }

  // reset() {
  //   this.repeat = false;
  //   this.shuffle = false;
  //   this.tracks = [];
  //   this.albums = [];
  //   this.artists = [];
  //   this.selectedArtists = [];
  //   this.selectedAlbums = [];
  //   this.playlist = [];
  //   this.oldPlaylist = null;
  //   this.currentTrack = null;
  //   this.audio.setSource('');
  //   this.onResetSource.next();
  // }

  addTrackToPlaylist(track: Track) {
    if (!_.includes(this.playlist, track)) {
      this.playlist.push(track);
    }
    if (this.shuffle && !_.includes(this.oldPlaylist, track)) {
      this.oldPlaylist.push(track);
    }
  }

  addTracksToPlaylist(obs: Observable<Track[]>) {
    obs.take(1).subscribe(tracks => {
      _.forEach(tracks, track => this.addTrackToPlaylist(track));
    });
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

  playTracks(obs: Observable<Track[]>, next?: Track) {
    obs.take(1).subscribe(tracks => {
      this.playlist = tracks;
      this.currentTrack = next ? next : this.playlist[0];
      if (this.shuffle) {
        this.shufflePlaylist();
      }
      this._playTrack(this.currentTrack);
    });
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

  // getAlbumsOf(artists: Artist[]): Album[] {
  //   if (_.isEqual(artists, [])) {
  //     return [];
  //   }
  //   const artistsNames = _.map(artists, 'name');
  //   // return _.filter(this.albums, (album: Album) => _.includes(artistsNames, album.artist));
  //   return [];
  // }

  // getTracksOf(albums: Album[]): Track[] {
  //   if (_.isEqual(albums, [])) {
  //     return [];
  //   }
  //   // return _.filter(this.tracks, track => {
  //   //   for (let i = 0; i < albums.length; i++) {
  //   //     if (albums[i].artist === track.metadata.albumArtist && albums[i].title === track.metadata.album) {
  //   //       return true;
  //   //     }
  //   //   }
  //   //   return false;
  //   // });
  //   return [];
  // }

  // Artists

  isSelectedArtist(artist: Artist): boolean {
    return _.includes(_.map(this.selectedArtists, 'name'), artist.name);
  }

  selectArtist(artist: Artist) {
    this.selectedArtists = [artist];
    this.filterSelectedAlbums();
  }

  deselectArtist(artist: Artist) {
    this.selectedArtists = _.filter(this.selectedArtists, a => !_.isEqual(a, artist));
    this.filterSelectedAlbums();
  }

  // selectArtistsByName(names: string[]) {
  //   // this.selectedArtists = _.filter(this.artists, artist => _.includes(names, artist.name));
  //   // this.onArtistSelectionChangedSource.next(this.selectedArtists);
  // }

  addArtist(artist: Artist) {
    if (!_.includes(_.map(this.selectedArtists, 'name'), artist.name)) {
      this.selectedArtists.push(artist);
    }
  }

  removeArtist(artist: Artist) {
    if (_.includes(_.map(this.selectedArtists, 'name'), artist.name)) {
      _.remove(this.selectedArtists, a => a.name === artist.name);
    }
    this.filterSelectedAlbums();
  }

  selectAllArtists(artists: Observable<Artist[]>) {
    artists.take(1).subscribe(a => this.selectedArtists = a);
  }

  deselectAllArtists() {
    this.selectedArtists = [];
    this.selectedAlbums = [];
  }

  // Albums

  isSelectedAlbum(album: Album): boolean {
    const selectedAlbumsIds = _.map(this.selectedAlbums, a => a.title + a.artist);
    return _.includes(selectedAlbumsIds, album.title + album.artist);
  }

  selectAlbum(album: Album) {
    this.selectedAlbums = [album];
  }

  deselectAlbum(album: Album) {
    this.selectedAlbums = _.filter(this.selectedAlbums, a => !_.isEqual(a, album));
  }

  // selectAlbumsByName(names: string[]) {
  //   // const oldSelection = this.selectedAlbums;
  //   // this.selectedAlbums = _.filter(this.albums, album => _.includes(names, album.title));
  //   // if (!_.isEqual(oldSelection, this.selectedAlbums)) {
  //   //   this.onAlbumSelectionChangedSource.next(this.selectedAlbums);
  //   // }
  // }

  addAlbum(album: Album) {
    const selectedAlbumsIds = _.map(this.selectedAlbums, a => a.title + a.artist);
    if (!_.includes(selectedAlbumsIds, album.title + album.artist)) {
      this.selectedAlbums.push(album);
    }
  }

  removeAlbum(album: Album) {
    const selectedAlbumsIds = _.map(this.selectedAlbums, a => a.title + a.artist);
    if (_.includes(selectedAlbumsIds, album.title + album.artist)) {
      _.remove(this.selectedAlbums, a => a.title === album.title && a.artist === album.artist);
    }
  }

  selectAllAlbums(albums: Observable<Album[]>) {
    albums.take(1).subscribe(a => this.selectedAlbums = a);
  }

  deselectAllAlbums() {
    this.selectedAlbums = [];
  }

  filterSelectedAlbums() {
    const artistsNames = _.map(this.selectedArtists, 'name');
    this.selectedAlbums = _.filter(this.selectedAlbums, album => _.includes(artistsNames, album.artist));
  }

  // scanLibrary(): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     this.reset();
  //     const currentId = ++this.httpSocketClient.id;
  //     const subscription1 = this.httpSocketClient
  //       .getSocket()
  //       .filter((r: SocketMessage) => r.method === 'TrackAdded' && r.id === currentId)
  //       .map((r: SocketMessage) => r.entity)
  //       .map((e: Track) => e)
  //       .subscribe(
  //         track => this.addTrack(track),
  //         error => reject(error)
  //       );
  //
  //     const subscription2 = this.httpSocketClient
  //       .getSocket()
  //       .filter((r: SocketMessage) => r.method === 'LibraryScanned' && r.id === currentId)
  //       .take(1)
  //       .subscribe(() => {
  //         subscription1.unsubscribe();
  //         subscription3.unsubscribe();
  //         resolve();
  //       });
  //
  //     const subscription3 = this.httpSocketClient
  //       .getSocket()
  //       .filter((r: SocketMessage) => r.method === 'LibraryScannedFailed' && r.id === currentId)
  //       .take(1)
  //       .subscribe(error => {
  //         subscription1.unsubscribe();
  //         subscription2.unsubscribe();
  //         reject(error);
  //       });
  //
  //     this.httpSocketClient.send({method: 'ScanLibrary', id: currentId, entity: null});
  //   });
  // }

  // updateTracks(): Promise<void> {
  //   // this.reset();
  //   return new Promise((resolve, reject) => {
  //     this.httpSocketClient.get('/api/libraries/tracks').subscribe(
  //       (tracks: Track[]) => {
  //         _.forEach(tracks, track => this.addTrack(track));
  //         this.onTracksUpdatedSource.next();
  //         resolve();
  //       },
  //       (error) => {
  //         reject(error);
  //       }
  //     );
  //   });
  // }

  private updateTracks(): Observable<Track[]> {
    return Observable.create(observer => {
      this.loader.load();
      this._updateTracksObs()
        .finally(() => this.loader.unload())
        .subscribe(observer);
      return () => {};
    }).publishLast()
      .refCount();
  }

  private _updateTracksObs(): Observable<Track[]> {
    return this.httpSocketClient.get('/api/libraries/tracks').map((tracks: Track[]) => tracks.map(LibraryService.fixTags));
    // .concatMap((tracks: Track[]) => Observable.from(tracks));
  }

  private scanTracks(): Observable<Track[]> {
    return this._scanTracksObs().scan((acc, track) => [LibraryService.fixTags(track), ...acc], []).publishReplay(1).refCount();
  }

  private _scanTracksObs(): Observable<Track> {
    return Observable.create((observer) => {
      this.loader.load();
      const currentId = ++this.httpSocketClient.id;
      const subscription1 = this.httpSocketClient
        .getSocket()
        .filter((r: SocketMessage) => r.method === 'TrackAdded' && r.id === currentId)
        .map((r: SocketMessage) => r.entity)
        .map((e: Track) => e)
        .subscribe(
          next => observer.next(next)
        );
      const subscription2 = this.httpSocketClient
        .getSocket()
        .filter((r: SocketMessage) => (r.method === 'LibraryScanned' || r.method === 'LibraryScannedFailed') && r.id === currentId)
        .take(1)
        .subscribe((n: SocketMessage) => {
          if (n.method === 'LibraryScanned') {
            observer.complete();
          } else {
            observer.error(n.entity);
          }
        });
      this.httpSocketClient.send({method: 'ScanLibrary', id: currentId, entity: null});
      return () => {
        this.loader.unload();
        subscription1.unsubscribe();
        subscription2.unsubscribe();
      };
    });
  }

  private _playTrack(track: Track) {
    this.titleService.setTitle(`Musicalypse • ${track.metadata.artist} - ${track.metadata.title}`);
    this.audio.setSource(LibraryService.resolveUrl(track.url));
    window.setTimeout(() => this.audio.play());
  }

}
