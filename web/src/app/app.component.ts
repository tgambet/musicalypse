import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import * as Material from '@angular/material';
import {AudioComponent} from './audio/audio.component';
// import {BreakpointObserver} from '@angular/cdk/layout';
import { Artist, Album, Track } from './model';
import * as _ from 'lodash';

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
    { id: '005', albumId: '01', artistId: '2', name: 'Cyanide', source: '/assets/music/zone.mp3', duration: 432 }
  ];

  selectedArtistsIds: string[] = [];
  selectedAlbumsIds: string[] = [];

  // isSmallScreen: boolean;

  constructor(
    // private breakpointObserver: BreakpointObserver
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
  }

  ngAfterViewInit(): void {

  }

  selectArtist(artist: Artist) {
    this.selectedArtistsIds = [artist.id];
  }

  addArtist(artist: Artist) {
    if (!_.includes(this.selectedArtistsIds, artist.id)) {
      this.selectedArtistsIds.push(artist.id);
    }
  }

  removeArtist(artist: Artist) {
    _.remove(this.selectedArtistsIds, a => a === artist.id);
  }

  isSelectedArtist(artist: Artist): boolean {
    return _.includes(this.selectedArtistsIds, artist.id);
  }

  getSelectedAlbums(): Album[] {
    return _.filter(this.albums, album => _.includes(this.selectedArtistsIds, album.artistId));
  }

  selectAlbum(album: Album) {
    this.selectedAlbumsIds = [album.id];
  }

  addAlbum(album: Album) {
    if (!_.includes(this.selectedAlbumsIds, album.id)) {
      this.selectedAlbumsIds.push(album.id);
    }
  }

  removeAlbum(album: Album) {
    _.remove(this.selectedAlbumsIds, a => a === album.id);
  }

  isSelectedAlbum(album: Album): boolean {
    return _.includes(this.selectedAlbumsIds, album.id);
  }

  getSelectedTracks(): Track[] {
    return _.filter(this.tracks, track => _.includes(this.selectedAlbumsIds, track.albumId));
  }

}
