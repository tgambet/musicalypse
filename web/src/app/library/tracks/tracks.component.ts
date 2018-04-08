import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Track} from '../../model';
import {LibraryService} from '../../services/library.service';
import {SettingsService} from '../../services/settings.service';
import {FavoritesService} from '../../services/favorites.service';
import {DetailsComponent} from '../../dialogs/details/details.component';
import {Subscription} from 'rxjs/Subscription';
import * as _ from 'lodash';

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['../library.component.common.scss', './tracks.component.scss']
})
export class TracksComponent implements OnInit, OnDestroy {

  @Output()
  onNext: EventEmitter<void> = new EventEmitter();
  @Output()
  onPrevious: EventEmitter<void> = new EventEmitter();

  @ViewChild('list')
  list: ElementRef;

  sortedAlphabetically = false;

  alphabet = [
    '#',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ];

  showSearch = false;
  search = '';

  filterAndSort: (tracks: Track[]) => Track[] = ((tracks: Track[]) => {
    let result: Track[] = tracks;
    const selectedAlbumsIds = _.map(this.library.selectedAlbums, album => album.title + album.artist);
    result = _.filter(result, track => _.includes(selectedAlbumsIds, track.metadata.album + track.metadata.artist));
    if (this.search !== '') {
      result = _.filter(result, track => track.metadata.title.toLowerCase().includes(this.search.toLowerCase()));
    }
    if (this.sortedAlphabetically) {
      result = _.sortBy(result, (t: Track) => t.metadata.title);
    } else {
      result = _.sortBy(result, (t: Track) => t.metadata.location);
    }
    return result;
  });

  private subscriptions: Subscription[] = [];

  constructor(
    public library: LibraryService,
    public favorites: FavoritesService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    public settings: SettingsService
  ) { }

  ngOnInit() {}

  ngOnDestroy(): void {
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  trackByURL(index: number, track: Track) {
    return track.url;
  }

  isMultipleAlbumsSelected(): boolean {
    return this.library.selectedAlbums.length > 1;
  }

  // addAllToPlaylist() {
  //   this.library.addTracksToPlaylist(this.filteredTracks);
  //   const tracks = this.filteredTracks.length > 1 ? 'tracks' : 'track';
  //   this.snackBar.open(`${this.filteredTracks.length} ${tracks} added to current playlist`, '', { duration: 1500 });
  // }

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

  scrollTo(letter: string) {
    const scrollOptions = {block: 'start', inline: 'nearest', behavior: 'smooth'};
    if (letter === '#') {
      this.list.nativeElement.getElementsByClassName('track')[0].scrollIntoView(scrollOptions);
      return;
    }
    const elem = _.find(this.list.nativeElement.getElementsByClassName('track'), artist => {
      return artist.getElementsByClassName('track-name')[0].innerText.toLowerCase().startsWith(letter.toLowerCase());
    });
    if (elem) {
      elem.scrollIntoView(scrollOptions);
    }
  }

}
