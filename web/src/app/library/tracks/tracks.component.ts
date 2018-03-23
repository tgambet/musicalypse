import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Album, Track} from '../../model';
import {AlbumsComponent} from '../albums/albums.component';
import {LibraryService} from '../../services/library.service';
import {FavoritesService} from '../../services/favorites.service';
import {DetailsComponent} from '../../dialogs/details/details.component';
import {Subscription} from 'rxjs/Subscription';
import * as _ from 'lodash';

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.scss', '../common.scss']
})
export class TracksComponent implements OnInit, OnDestroy {

  @Output()
  onNext: EventEmitter<void> = new EventEmitter();
  @Output()
  onPrevious: EventEmitter<void> = new EventEmitter();

  @Input('albumsComponent')
  albumsComponent: AlbumsComponent;

  search = '';
  tracks: Track[] = [];
  filteredTracks: Track[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    public library: LibraryService,
    public favorites: FavoritesService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    const updateTracks: (albums: Album[]) => void = (albums) => {
      this.tracks = this.library.getTracksOf(albums);
      this.sortByFilename();
    };
    updateTracks(this.albumsComponent.selectedAlbums);
    this.albumsComponent.onSelectionChange.subscribe(albums => updateTracks(albums));
    this.subscriptions.push(
      this.library.onTrackAdded.subscribe(() => updateTracks(this.albumsComponent.selectedAlbums))
    );
    this.subscriptions.push(
      this.library.onReset.subscribe(() => { this.tracks = []; this.filteredTracks = []; })
    );
  }

  ngOnDestroy(): void {
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
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

  addAllToPlaylist() {
    this.library.addTracksToPlaylist(this.filteredTracks);
    const tracks = this.filteredTracks.length > 1 ? 'tracks' : 'track';
    this.snackBar.open(`${this.filteredTracks.length} ${tracks} added to current playlist`, '', { duration: 1500 });
  }

  addTrackToPlaylist(track: Track) {
    this.library.addTrackToPlaylist(track);
    this.snackBar.open('Track added to current playlist', '', { duration: 1500 });
  }

  openDetailsDialog(track: Track) {
    const dialogRef = this.dialog.open(DetailsComponent, {
      // maxWidth: '500px',
      data: { track: track }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      // this.animal = result;
    });
  }

}
