import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import * as Material from '@angular/material';
import {AudioComponent} from './audio/audio.component';
// import {BreakpointObserver} from '@angular/cdk/layout';
import { Artist, Album, Track } from './model';
import * as _ from 'lodash';
import {HttpSocketClientService} from './services/http-socket-client.service';

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

  artists: Artist[] = [
    { id: '0', name: 'Orelsan', songsNumber: 21 },
    { id: '1', name: 'IAM', songsNumber: 45 },
    { id: '2', name: 'Metallica', songsNumber: 73 },
  ];

  albums: Album[] = [
    { id: '00', artistId: '2', name: 'The Black album', songsNumber: 35 },
    { id: '01', artistId: '2', name: 'Death Magnetic', songsNumber: 38 },
    { id: '02', artistId: '0', name: 'La Fête Est Finie', songsNumber: 38 }
  ];

  tracks: Track[] = [
    { id: '000', albumId: '01', artistId: '2', name: 'That Was Just Your Life', source: '/assets/music/zone.mp3', duration: 120 },
    { id: '001', albumId: '01', artistId: '2', name: 'The End Of The Line', source: '/assets/music/zone.mp3', duration: 145 },
    { id: '002', albumId: '01', artistId: '2', name: 'Broken, Beat and Scarred', source: '/assets/music/zone.mp3', duration: 264 },
    { id: '003', albumId: '01', artistId: '2', name: 'The Day That Never Comes', source: '/assets/music/zone.mp3', duration: 186 },
    { id: '004', albumId: '01', artistId: '2', name: 'All Nightmare Long', source: '/assets/music/zone.mp3', duration: 321 },
    { id: '005', albumId: '02', artistId: '0', name: 'San', source: '/assets/music/1 - San.mp3', duration: 432 },
    { id: '006',
      albumId: '02', artistId: '0', name: 'La fête est finie', source: '/assets/music/2 - La fete est finie.mp3', duration: 432 },
    { id: '007', albumId: '02', artistId: '0', name: 'Basique', source: '/assets/music/3 - Basique .mp3', duration: 432 },
    { id: '008', albumId: '02', artistId: '0', name: 'Tout va bien', source: '/assets/music/4 - Tout va bien .mp3', duration: 432 },
    { id: '009',
      albumId: '02', artistId: '0', name: 'Défaite de famille', source: '/assets/music/5 - Defaite de famille.mp3', duration: 432 },
    { id: '010', albumId: '02', artistId: '0', name: 'La Lumière', source: '/assets/music/6 - La lumiere .mp3', duration: 432 },
    { id: '011', albumId: '02', artistId: '0', name: 'Bonne Meuf', source: '/assets/music/7 - Bonne Meuf .mp3', duration: 432 }
  ];

  selectedArtists: Artist[] = [];
  selectedAlbums: Album[] = [];

  currentTrack: Track = this.tracks[0];

  // isSmallScreen: boolean;

  constructor(
    // private breakpointObserver: BreakpointObserver
    public httpSocketClient: HttpSocketClientService
  ) {}

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
    this.sidenav.open();
    this.openSocket();
  }

  ngAfterViewInit(): void {

  }

  openSocket() {
    this.httpSocketClient.getSocket().subscribe(
      (next) => console.log(next),
      error => console.log(error),
      () => console.log('socket completed')
    );
  }

  closeSocket() {
    this.httpSocketClient.closeSocket();
  }

  selectArtist(artist: Artist) {
    this.selectedArtists = [artist];
  }

  addArtist(artist: Artist) {
    if (!_.includes(this.selectedArtists, artist)) {
      this.selectedArtists.push(artist);
    }
  }

  removeArtist(artist: Artist) {
    _.remove(this.selectedArtists, a => a.id === artist.id);
    _.remove(this.selectedAlbums, a => a.artistId === artist.id);
  }

  isSelectedArtist(artist: Artist): boolean {
    return _.includes(this.selectedArtists, artist);
  }

  getAlbumsOf(artists: Artist[]): Album[] {
    return _.filter(this.albums, album => _.includes(_.map(artists, 'id'), album.artistId));
  }

  getDisplayedAlbums() {
    if (this.selectedArtists.length === 0) {
      return this.albums;
    } else {
      return this.getAlbumsOf(this.selectedArtists);
    }
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
    _.remove(this.selectedAlbums, a => a.id === album.id);
  }

  isSelectedAlbum(album: Album): boolean {
    return _.includes(this.selectedAlbums, album);
  }

  getTracksOf(albums: Album[]): Track[] {
    return _.filter(this.tracks, track => _.includes(_.map(albums, 'id'), track.albumId));
  }

  getTracksOfArtists(artists: Artist[]): Track[] {
    return _.filter(this.tracks, track => _.includes(_.map(artists, 'id'), track.artistId));
  }

  getDisplayedTracks() {
    if (this.selectedArtists.length === 0 && this.selectedAlbums.length === 0) {
      return this.tracks;
    }
    if (this.selectedAlbums.length === 0) {
      return this.getTracksOfArtists(this.selectedArtists);
    }
    return this.getTracksOf(this.selectedAlbums);
  }

  playTrack(track: Track) {
    if (this.currentTrack === track) {
      this.audio.play();
    } else {
      this.audio.pause();
      // this.audio.seekTo(0);
      this.currentTrack = track;
      window.setTimeout(() => {
        this.audio.play();
      }, 0);
    }
  }

  scanLibrary() {
    this.httpSocketClient.send({method: 'ScanLibrary', id: 0, entity: null});
  }

}
