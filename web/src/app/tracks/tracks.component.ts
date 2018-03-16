import {Component, Input, OnInit} from '@angular/core';
import {Album, Track} from '../model';
import {AlbumsComponent} from '../albums/albums.component';
import {LibraryService} from '../services/library.service';
import {AudioComponent} from '../audio/audio.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.scss', '../common.scss']
})
export class TracksComponent implements OnInit {

  @Input('albumsComponent')
  albumsComponent: AlbumsComponent;

  @Input('audioComponent')
  audioComponent: AudioComponent;

  search = '';
  tracks: Track[] = [];
  filteredTracks: Track[] = [];

  constructor(private library: LibraryService) { }

  ngOnInit() {
    const updateTracks: (albums: Album[]) => void = (albums) => {
      this.tracks = this.library.getTracksOf(albums);
      this.sortByFilename();
    };
    updateTracks(this.albumsComponent.selectedAlbums);
    this.albumsComponent.onSelectionChange.subscribe(albums => updateTracks(albums));
    this.library.onTrackAdded.subscribe(() => updateTracks(this.albumsComponent.selectedAlbums));
  }

  sortAlphabetically() {
    this.tracks = _.sortBy(this.tracks, (t: Track) => t.metadata.title);
    this.filter();
  }

  sortByFilename() {
    this.tracks = _.sortBy(this.tracks, (t: Track) => t.metadata.location);
    this.filter();
  }

  filter() {
    if (this.search !== '') {
      this.filteredTracks = _.filter(this.tracks, track => track.metadata.title.toLowerCase().includes(this.search.toLowerCase()));
    } else {
      this.filteredTracks = this.tracks;
    }
  }

  isMultipleAlbumsSelected(): boolean {
    return this.albumsComponent.selectedAlbums.length > 1;
  }

}
