import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Album, Artist} from '../../model';
import {ArtistsComponent} from '../artists/artists.component';
import {LibraryService} from '../../services/library.service';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import * as _ from 'lodash';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss', '../common.scss']
})
export class AlbumsComponent implements OnInit, OnDestroy {

  @Output()
  onNext: EventEmitter<void> = new EventEmitter();
  @Output()
  onPrevious: EventEmitter<void> = new EventEmitter();

  @Input('artistsComponent')
  artistsComponent: ArtistsComponent;

  search = '';
  albums: Album[] = [];
  filteredAlbums: Album[] = [];
  selectedAlbums: Album[] = [];

  onSelectionChange: Observable<Album[]>;

  private onSelectionChangeSource: Subject<Album[]> = new Subject();

  private subscriptions: Subscription[] = [];

  constructor(private library: LibraryService) {
    this.onSelectionChange = this.onSelectionChangeSource.asObservable();
  }

  ngOnInit() {
    const updateAlbumsSelection: (artists: Artist[]) => void = artists => {
      this.albums = this.library.getAlbumsOf(artists);
      this.sortAlphabetically();
      const artistsNames = _.map(artists, 'name');
      const oldSelection = this.selectedAlbums;
      this.selectedAlbums = _.filter(this.selectedAlbums, album => _.includes(artistsNames, album.artist));
      if (!_.isEqual(oldSelection, this.selectedAlbums)) {
        this.onSelectionChangeSource.next(this.selectedAlbums);
      }
    };
    // Subscribe to ArtistsComponent selection changes
    this.artistsComponent.onSelectionChange.subscribe(artists => updateAlbumsSelection(artists));
    // Subscribe to new tracks and library reset
    this.subscriptions.push(
      this.library.onTrackAdded.subscribe(() => {
        if (!_.isEqual(this.artistsComponent.selectedArtists, [])) {
          this.albums = this.library.getAlbumsOf(this.artistsComponent.selectedArtists);
          this.sortAlphabetically();
        }
      })
    );
    this.subscriptions.push(
      this.library.onReset.subscribe(() => { this.albums = []; this.selectedAlbums = []; this.filteredAlbums = []; })
    );
  }

  ngOnDestroy(): void {
    this.onSelectionChangeSource.complete();
    this.onSelectionChangeSource.unsubscribe();
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  trackByTitle(index: number, album: Album) {
    return album.title;
  }

  selectAlbum(album: Album) {
    if (!_.isEqual(this.selectedAlbums, [album])) {
      this.selectedAlbums = [album];
      this.onSelectionChangeSource.next([album]);
    }
  }

  selectAlbumsByName(names: string[]) {
    const oldSelection = this.selectedAlbums;
    this.selectedAlbums = _.filter(this.albums, album => _.includes(names, album.title));
    if (!_.isEqual(oldSelection, this.selectedAlbums)) {
      this.onSelectionChangeSource.next(this.selectedAlbums);
    }
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

  deselectAll() {
    if (this.selectedAlbums === []) {
      return;
    } else {
      this.selectedAlbums = [];
      this.onSelectionChangeSource.next([]);
    }
  }

  sortAlphabetically() {
    this.albums = _.sortBy(this.albums, album => album.title.toLowerCase());
    this.filter();
  }

  sortBySongs() {
    this.albums = _.sortBy(_.sortBy(this.albums, 'title').reverse(), 'songs').reverse();
    this.filter();
  }

  filter() {
    if (this.search !== '') {
      this.filteredAlbums = _.filter(this.albums, album => album.title.toLowerCase().includes(this.search.toLowerCase()));
    } else {
      this.filteredAlbums = this.albums;
    }
  }

  isMultipleArtistsSelected(): boolean {
    return this.artistsComponent.selectedArtists.length > 1;
  }

}
