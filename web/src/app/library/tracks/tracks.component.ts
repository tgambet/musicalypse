import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Album, Track} from '../../model';
import {LibraryService} from '../../services/library.service';
import {SettingsService} from '../../services/settings.service';
import {FavoritesService} from '../../services/favorites.service';
import {DetailsComponent} from '../../dialogs/details/details.component';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import * as _ from 'lodash';
import {AudioComponent} from '../../audio/audio.component';

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['../library.component.common.scss', './tracks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TracksComponent implements OnInit, OnDestroy {

  @Output()
  onNext: EventEmitter<void> = new EventEmitter();
  @Output()
  onPrevious: EventEmitter<void> = new EventEmitter();

  @Input('selectedAlbums')
  selectedAlbums: Album[];
  @Input('tracks')
  tracks: Observable<Track[]>;
  @Input('currentTrack')
  currentTrack: Track;

  @Input('audio')
  audio: AudioComponent;

  @Input('playing')
  playing: boolean;
  @Input('loading')
  loading: boolean;
  @Input('currentTime')
  currentTime: number;
  @Input('duration')
  duration: number;

  @ViewChild('list')
  list: ElementRef;

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

  filter: (tracks: Track[]) => Track[] = ((tracks: Track[]) => {
    if (this.search !== '') {
      return _.filter(tracks, track => track.metadata.title.toLowerCase().includes(this.search.toLowerCase()));
    }
    return tracks.slice(0, 300); // TODO add a warning if there are more tracks, perf review
  });

  private subscriptions: Subscription[] = [];

  constructor(
    public library: LibraryService,
    public favorites: FavoritesService,
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
    return this.selectedAlbums.length > 1;
  }

  // addAllToPlaylist() {
  //   this.library.addTracksToPlaylist(this.filteredTracks);
  //   const tracks = this.filteredTracks.length > 1 ? 'tracks' : 'track';
  //   this.snackBar.open(`${this.filteredTracks.length} ${tracks} added to current playlist`, '', { duration: 1500 });
  // }

  // addTrackToPlaylist(track: Track) {
  //   this.library.addTrackToPlaylist(track);
  //   this.snackBar.open('Track added to current playlist', '', { duration: 1500 });
  // }

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
