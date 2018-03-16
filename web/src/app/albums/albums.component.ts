import {Component, Input, OnInit} from '@angular/core';
import {Album, Artist} from '../model';
import * as _ from 'lodash';
import {ArtistsComponent} from '../artists/artists.component';
import {LibraryService} from '../services/library.service';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss', '../common.scss']
})
export class AlbumsComponent implements OnInit {

  @Input('artistsComponent')
  artistsComponent: ArtistsComponent;

  albums: Album[] = [];

  selectedAlbums: Album[] = [];

  onSelectionChange: Observable<Album[]>;

  private onSelectionChangeSource: Subject<Album[]> = new Subject();

  constructor(private library: LibraryService) { }

  ngOnInit() {
    // Initialize
    this.onSelectionChange = this.onSelectionChangeSource.asObservable();
    this.updateAlbumsSelection(this.artistsComponent.selectedArtists);
    // Subscribe to ArtistsComponent selection changes
    this.artistsComponent.onSelectionChange.subscribe(
      artists => this.updateAlbumsSelection(artists)
    );
    // Subscribe to new tracks and library reset
    this.library.onTrackAdded.subscribe(
      () => {
        this.albums = this.library.getAlbumsOf(this.artistsComponent.selectedArtists);
        this.sortAlphabetically();
      }
    );
  }

  selectAlbum(album: Album) {
    this.selectedAlbums = [album];
    this.onSelectionChangeSource.next([album]);
  }

  addAlbum(album: Album) {
    if (!_.includes(this.selectedAlbums, album)) {
      this.selectedAlbums.push(album);
      this.onSelectionChangeSource.next(this.selectedAlbums);
    }
  }

  removeAlbum(album: Album) {
    if (_.includes(this.selectedAlbums, album)) {
      _.remove(this.selectedAlbums, a => a.title === album.title);
      this.onSelectionChangeSource.next(this.selectedAlbums);
    }
  }

  isSelectedAlbum(album: Album): boolean {
    return _.includes(this.selectedAlbums, album);
  }

  selectAll() {
    this.selectedAlbums = _.clone(this.albums);
    this.onSelectionChangeSource.next(this.selectedAlbums);
  }

  sortAlphabetically() {
    this.albums = _.sortBy(this.albums, 'title');
  }

  sortBySongs() {
    this.albums = _.sortBy(_.sortBy(this.albums, 'title').reverse(), 'songs').reverse();
  }

  isMultipleArtistsSelected(): boolean {
    return this.artistsComponent.selectedArtists.length > 1;
  }

  private updateAlbumsSelection(artists: Artist[]) {
    this.albums = this.library.getAlbumsOf(artists);
    this.sortAlphabetically();
    const artistsNames = _.map(artists, 'name');
    this.selectedAlbums = _.filter(this.selectedAlbums, album => _.includes(artistsNames, album.artist));
    this.onSelectionChangeSource.next(this.selectedAlbums);
  }

}
