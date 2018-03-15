import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import * as Material from '@angular/material';
import {AudioComponent} from './audio/audio.component';
// import {BreakpointObserver} from '@angular/cdk/layout';
import { Artist, Album, Track, SocketMessage } from './model';
import * as _ from 'lodash';
import {HttpSocketClientService} from './services/http-socket-client.service';
import {LibraryService} from './services/library.service';
import {OverlayContainer} from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('sidenav')
  sidenav: Material.MatSidenav;

  @ViewChild(AudioComponent)
  audio: AudioComponent;

  selectedArtists: Artist[] = [];
  selectedAlbums: Album[] = [];

  // currentTrack: Track;

  themeClass = 'dark-theme';

  // isSmallScreen: boolean;

  private id = 0;

  constructor(
    // private breakpointObserver: BreakpointObserver
    private overlayContainer: OverlayContainer,
    public httpSocketClient: HttpSocketClientService,
    public library: LibraryService
  ) {
    overlayContainer.getContainerElement().classList.add(this.themeClass);
  }

  ngOnInit(): void {
/*    this.breakpointObserver.observe('(max-width: 960px)').subscribe(result => {
      if (result.matches) {
        this.isSmallScreen = true;
        this.sidenav.close();
      } else {
        this.isSmallScreen = false;
        this.sidenav.open();
      }
    });*/
    // this.sidenav.open();
    // this.openSocket();
  }

  ngAfterViewInit(): void {

  }

  changeTheme(theme: string) {
    this.overlayContainer.getContainerElement().classList.remove(this.themeClass);
    this.overlayContainer.getContainerElement().classList.add(theme);
    this.themeClass = theme;
  }

  getDisplayedArtists() {
    return this.library.artists;
  }

  selectArtist(artist: Artist) {
    this.selectedArtists = [artist];
    this.selectedAlbums = [];
  }

  addArtist(artist: Artist) {
    if (!_.includes(this.selectedArtists, artist)) {
      this.selectedArtists.push(artist);
    }
  }

  removeArtist(artist: Artist) {
    _.remove(this.selectedArtists, a => a.name === artist.name);
    _.remove(this.selectedAlbums, a => a.artist === artist.name);
  }

  isSelectedArtist(artist: Artist): boolean {
    return _.includes(this.selectedArtists, artist);
  }

  getAlbumsOf(artists: Artist[]): Album[] {
    return _.filter(this.library.albums, album => _.includes(_.map(artists, 'name'), album.artist));
  }

  getDisplayedAlbums() {
    // if (this.selectedArtists.length === 0) {
    //   return this.library.albums;
    // } else {
      return this.getAlbumsOf(this.selectedArtists);
    // }
  }

  selectAlbum(album: Album) {
    this.selectedAlbums = [album];
  }

  addAlbum(album: Album) {
    if (!_.includes(this.selectedAlbums, album)) {
      this.selectedAlbums.push(album);
    }
  }

  removeAlbum(album: Album) {
    _.remove(this.selectedAlbums, a => a.title === album.title);
  }

  isSelectedAlbum(album: Album): boolean {
    return _.includes(this.selectedAlbums, album);
  }

  getTracksOf(albums: Album[]): Track[] {
    const albumTitles = _.map(albums, 'title');
    return _.filter(this.library.tracks, track => _.includes(albumTitles, track.metadata.album));
  }

  // getTracksOfArtists(artists: Artist[]): Track[] {
  //   const artistNames = _.map(artists, 'name');
  //   return _.filter(this.library.tracks, track => _.includes(artistNames, track.metadata.artist));
  // }

  getDisplayedTracks() {
    // if (this.selectedArtists.length === 0 && this.selectedAlbums.length === 0) {
    //   return this.library.tracks;
    // }
    // if (this.selectedAlbums.length === 0) {
    //   return this.getTracksOfArtists(this.selectedArtists);
    // }
    return this.getTracksOf(this.selectedAlbums);
  }

  scanLibrary() {
    const currentId = ++this.id;
    const subscription1 = this.httpSocketClient
      .openSocket()
      .filter((r: SocketMessage) => r.method === 'TrackAdded' && r.id === currentId)
      .map((r: SocketMessage) => r.entity)
      .map((e: Track) => e)
      .subscribe(track => {
        // console.log(next);
        this.library.addTrack(track);
      });

    this.httpSocketClient
      .openSocket()
      .filter((r: SocketMessage) => r.method === 'LibraryScanned' && r.id === currentId)
      .take(1)
      .subscribe((next) => subscription1.unsubscribe());

    this.httpSocketClient.send({method: 'ScanLibrary', id: currentId, entity: null});
  }

  onPlayEnded() {
    // if repeat is on or it is not the last song
    if (this.library.repeat || this.library.isCurrentTrackLastInPlaylist()) {
      this.library.playNextTrackInPlaylist();
    } else {
      this.library.currentTrack = null;
      this.audio.setSource('');
    }
  }

}
