import {Component, Input, OnInit} from '@angular/core';
import {Track} from '../model';
import {AlbumsComponent} from '../albums/albums.component';
import {LibraryService} from '../services/library.service';
import {AudioComponent} from '../audio/audio.component';

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

  tracks: Track[];

  constructor(private library: LibraryService) { }

  ngOnInit() {
    this.tracks = this.library.getTracksOf(this.albumsComponent.selectedAlbums);
    this.albumsComponent.onSelectionChange.subscribe(
      albums => {
        this.tracks = this.library.getTracksOf(albums);
      }
    );
    this.library.onTrackAdded.subscribe(() => {
      this.tracks = this.library.getTracksOf(this.albumsComponent.selectedAlbums);
    });
  }

}
