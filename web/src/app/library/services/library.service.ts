import {Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Album, Artist, Track} from '@app/model';
import {environment} from '@env/environment';
import {HttpSocketClientService, SocketMessage} from '@app/core/services/http-socket-client.service';
import {LoaderService} from '@app/core/services/loader.service';
import {EMPTY, Observable, of} from 'rxjs';
import {finalize, publishReplay, refCount} from 'rxjs/operators';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/scan';
import 'rxjs/observable/from';
import 'rxjs/observable/empty';
import * as _ from 'lodash';
import {AudioService} from '@app/core/services/audio.service';

@Injectable()
export class LibraryService {

  currentTrack: Track;

  selectedArtists: Artist[] = [];
  selectedAlbums: Album[] = [];

  playlist: Track[] = [];
  oldPlaylist: Track[];

  isScanning = false;
  repeat = false;
  shuffle = false;
  sortTracksAlphabetically = false;

  trackSource:  Observable<Track[]>;
  artistSource: Observable<Artist[]>;
  albumSource:  Observable<Album[]>;

  tracks: Observable<Track[]> = EMPTY;
  artists: Observable<Artist[]> = of([]);
  albums: Observable<Album[]> = EMPTY;

  constructor(
    private httpSocketClient: HttpSocketClientService,
    private titleService: Title,
    private loader: LoaderService,
    private audioService: AudioService
  ) {
    // this.update();
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

  public static fixTags(track: Track): Track {
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

  public static extractArtists(tracks: Track[]): Artist[] {
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

  public static extractAlbums(tracks: Track[]): Album[] {
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

  private static processArtists(artists: Artist[]): Artist[] {
    return _.sortBy(artists, album => album.name.toLowerCase());
  }

  private static processAlbums(albums: Album[], selectedArtists: Artist[]): Album[] {
    let result: Album[] = albums;
    const selectedArtistsName = _.map(selectedArtists, 'name');
    result = _.filter(result, (album: Album) => _.includes(selectedArtistsName, album.artist));
    result = _.sortBy(result, album => album.title.toLowerCase());
    return result;
  }

  private static processTracks(tracks: Track[], selectedAlbums: Album[], sortAlphabetically = false): Track[] {
    let result: Track[] = tracks;
    const selectedAlbumsIds = _.map(selectedAlbums, album => album.title + album.artist);
    result = _.filter(result, track => _.includes(selectedAlbumsIds, track.metadata.album + track.metadata.albumArtist));
    if (sortAlphabetically) {
      result = _.sortBy(result, (t: Track) => t.metadata.title);
    } else {
      result = _.sortBy(result, (t: Track) => t.metadata.location);
    }
    return result;
  }

  scan() {
    this.selectedArtists = [];
    this.selectedAlbums = [];
    this.isScanning = true;

    this.trackSource = this.scanTracks()
      .pipe(
        finalize(() => this.isScanning = false),
        publishReplay(1),
        refCount()
      );

    this.artistSource = this.trackSource
      .map(LibraryService.extractArtists)
      .publishReplay(1)
      .refCount();

    this.albumSource = this.trackSource
      .map(LibraryService.extractAlbums)
      .publishReplay(1)
      .refCount();

    this.tracks = this.processTracksObs(true);

    this.artists = this.processArtistsObs(true);

    this.albums = this.processAlbumsObs(true);
  }

  update() {
    this.selectedArtists = [];
    this.selectedAlbums = [];

    this.trackSource = this.updateTracks()
      .publishLast()
      .refCount();

    this.artistSource = this.trackSource
      .map(LibraryService.extractArtists)
      .publishLast()
      .refCount();

    this.albumSource = this.trackSource
      .map(LibraryService.extractAlbums)
      .publishLast()
      .refCount();

    this.tracks = this.processTracksObs();

    this.artists = this.processArtistsObs();

    this.albums = this.processAlbumsObs();
  }

  // setAudioComponent(audioComponent: AudioComponent) {
  //   if (this.audio) {
  //     throw Error('AudioComponent already set!');
  //   }
  //   this.audio = audioComponent;
  //   this.audio.playEnd.asObservable().subscribe(
  //     () => {
  //       if (this.playlist.length > 0 && (this.repeat || !this.isCurrentTrackLastInPlaylist())) {
  //         this.playNextTrackInPlaylist();
  //       } else {
  //         this.currentTrack = null;
  //         this.audio.setSource('');
  //       }
  //     }
  //   );
  // }

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

  // addTracksToPlaylist(obs: Observable<Track[]>) {
  //   obs.take(1).subscribe(tracks => {
  //     _.forEach(tracks, track => this.addTrackToPlaylist(track));
  //   });
  // }

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

  // playTracks(obs: Observable<Track[]>, next?: Track) {
  //   obs.take(1).subscribe(tracks => {
  //     this.playlist = tracks;
  //     this.currentTrack = next ? next : this.playlist[0];
  //     if (this.shuffle) {
  //       this.shufflePlaylist();
  //     }
  //     this._playTrack(this.currentTrack);
  //   });
  // }

  playTracks(tracks: Track[], next?: Track) {
    this.playlist = tracks;
    this.currentTrack = next ? next : this.playlist[0];
    if (this.shuffle) {
      this.shufflePlaylist();
    }
    this._playTrack(this.currentTrack);
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

  // Artists

  isSelectedArtist(artist: Artist): boolean {
    return _.includes(_.map(this.selectedArtists, 'name'), artist.name);
  }

  selectArtist(artist: Artist) {
    this.selectedArtists = [artist];
    this.filterSelectedAlbums();
    this.albums = this.processAlbumsObs(this.isScanning);
    this.tracks = this.processTracksObs(this.isScanning);
  }

  deselectArtist(artist: Artist) {
    this.selectedArtists = _.filter(this.selectedArtists, a => !_.isEqual(a, artist));
    this.filterSelectedAlbums();
    this.albums = this.processAlbumsObs(this.isScanning);
    this.tracks = this.processTracksObs(this.isScanning);
  }

  // selectArtistsByName(names: string[]) {
  //   // this.selectedArtists = _.filter(this.artists, artist => _.includes(names, artist.name));
  //   // this.onArtistSelectionChangedSource.next(this.selectedArtists);
  // }

  addArtist(artist: Artist) {
    if (!_.includes(_.map(this.selectedArtists, 'name'), artist.name)) {
      this.selectedArtists = [...this.selectedArtists, artist];
    }
    this.albums = this.processAlbumsObs(this.isScanning);
    this.tracks = this.processTracksObs(this.isScanning);
  }

  selectAllArtists(artists: Observable<Artist[]>) {
    artists.take(1).subscribe(a => this.selectedArtists = a);
    this.albums = this.processAlbumsObs(this.isScanning);
    this.tracks = this.processTracksObs(this.isScanning);
  }

  deselectAllArtists() {
    this.selectedArtists = [];
    this.selectedAlbums = [];
    this.albums = this.processAlbumsObs(this.isScanning);
    this.tracks = this.processTracksObs(this.isScanning);
  }

  filterSelectedAlbums() {
    const artistsNames = _.map(this.selectedArtists, 'name');
    this.selectedAlbums = _.filter(this.selectedAlbums, album => _.includes(artistsNames, album.artist));
  }

  // Albums

  isSelectedAlbum(album: Album): boolean {
    const selectedAlbumsIds = _.map(this.selectedAlbums, a => a.title + a.artist);
    return _.includes(selectedAlbumsIds, album.title + album.artist);
  }

  selectAlbum(album: Album) {
    this.selectedAlbums = [album];
    this.tracks = this.processTracksObs(this.isScanning);
  }

  deselectAlbum(album: Album) {
    this.selectedAlbums = _.filter(this.selectedAlbums, a => !_.isEqual(a, album));
    this.tracks = this.processTracksObs(this.isScanning);
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
      this.selectedAlbums = [...this.selectedAlbums, album];
    }
    this.tracks = this.processTracksObs(this.isScanning);
  }

  selectAllAlbums(albums: Album[]) {
    this.selectedAlbums = albums;
    this.tracks = this.processTracksObs(this.isScanning);
  }

  deselectAllAlbums() {
    this.selectedAlbums = [];
    this.tracks = this.processTracksObs(this.isScanning);
  }

  // Tracks

  sortTracks(alphabetically: boolean = true) {
    this.sortTracksAlphabetically = alphabetically;
    this.tracks = this.processTracksObs(this.isScanning);
  }

  // Privates

  private processTracksObs(replay = false) {
    const obs = this.trackSource
      .map(tracks => LibraryService.processTracks(tracks, this.selectedAlbums, this.sortTracksAlphabetically));
    if (replay) {
      return obs.publishReplay(1).refCount();
    } else {
      return obs.publishLast().refCount();
    }
  }

  private processArtistsObs(replay = false) {
    const obs = this.artistSource.map(LibraryService.processArtists);
    if (replay) {
      return obs.publishReplay(1).refCount();
    } else {
      return obs.publishLast().refCount();
    }
  }

  private processAlbumsObs(replay = false) {
    const obs = this.albumSource
      .map(albums => LibraryService.processAlbums(albums, this.selectedArtists));
    if (replay) {
      return obs.publishReplay(1).refCount();
    } else {
      return obs.publishLast().refCount();
    }
  }

  private updateTracks(): Observable<Track[]> {
    return Observable.create(observer => {
      this.loader.load();
      this._updateTracksObs()
        .finally(() => this.loader.unload())
        .subscribe(observer);
      return () => {};
    });
  }

  private _updateTracksObs(): Observable<Track[]> {
    return this.httpSocketClient.get('/api/libraries/tracks').map((tracks: Track[]) => tracks.map(LibraryService.fixTags));
    // .concatMap((tracks: Track[]) => Observable.from(tracks));
  }

  private scanTracks(): Observable<Track[]> {
    return this._scanTracksObs().scan((acc, track) => [LibraryService.fixTags(track), ...acc], []);
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
          // TODO manage errors
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
    // this.audio.setSource(LibraryService.resolveUrl(track.url));
    this.audioService.play(LibraryService.resolveUrl(track.url));
    // window.setTimeout(() => this.audio.play());
  }

}
