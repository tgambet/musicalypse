import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Artist} from '../../model';
import {LibraryService} from '../../services/library.service';
import {SettingsService} from '../../services/settings.service';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import * as _ from 'lodash';

@Component({
  selector: 'app-artists',
  templateUrl: './artists.component.html',
  styleUrls: ['../library.component.common.scss', './artists.component.scss']
})
export class ArtistsComponent implements OnInit, OnDestroy {

  @Output()
  onNext: EventEmitter<void> = new EventEmitter();

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

  showChipList = false;
  showSearch = false;
  search = '';
  artists: Artist[] = [];
  filteredArtists: Artist[] = [];
  selectedArtists: Artist[] = [];

  onSelectionChange: Observable<Artist[]>;

  private onSelectionChangeSource: Subject<Artist[]> = new Subject();

  private subscriptions: Subscription[] = [];

  constructor(
    private library: LibraryService,
    public settings: SettingsService,
    private sanitizer: DomSanitizer
  ) {
    this.onSelectionChange = this.onSelectionChangeSource.asObservable();
  }

  ngOnInit() {
    const updateArtists: () => void = () => {
      this.artists = _.clone(this.library.artists);
      this.sortAlphabetically();
    };
    // Initialize
    updateArtists();
    // subscribe to new tracks and library reset
    this.subscriptions.push(
      this.library.onTrackAdded.subscribe(() => updateArtists())
    );
    this.subscriptions.push(
      this.library.onReset.subscribe(() => { this.artists = []; this.selectedArtists = []; this.filteredArtists = []; })
    );
  }

  ngOnDestroy(): void {
    this.onSelectionChangeSource.complete();
    this.onSelectionChangeSource.unsubscribe();
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  trackByName(index: number, artist: Artist) {
    return artist.name;
  }

  getAvatarStyle(artist: Artist) {
    return artist.avatarUrl ? this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${artist.avatarUrl}")`) : '';
  }

  isSelectedArtist(artist: Artist): boolean {
    return _.includes(this.selectedArtists, artist);
  }

  selectArtist(artist: Artist) {
    if (!_.isEqual(this.selectedArtists, [artist])) {
      this.selectedArtists = [artist];
      this.onSelectionChangeSource.next([artist]);
      this.showChipList = false;
    }
  }

  deselectArtist(artist: Artist) {
    if (_.includes(this.selectedArtists, artist)) {
      this.selectedArtists = _.filter(this.selectedArtists, a => a !== artist);
      this.onSelectionChangeSource.next(this.selectedArtists);
      if (this.selectedArtists.length < 3) {
        this.showChipList = false;
      }
    }
  }

  selectArtistsByName(names: string[]) {
    const oldSelection = this.selectedArtists;
    this.selectedArtists = _.filter(this.artists, artist => _.includes(names, artist.name));
    if (!_.isEqual(oldSelection, this.selectedArtists)) {
      this.onSelectionChangeSource.next(this.selectedArtists);
    }
  }

  addArtist(artist: Artist) {
    if (!_.includes(this.selectedArtists, artist)) {
      this.selectedArtists.push(artist);
      this.onSelectionChangeSource.next(this.selectedArtists);
    }
  }

  removeArtist(artist: Artist) {
    if (_.includes(this.selectedArtists, artist)) {
      _.remove(this.selectedArtists, a => a.name === artist.name);
      this.onSelectionChangeSource.next(this.selectedArtists);
    }
  }

  selectAll() {
    this.selectedArtists = _.clone(this.artists);
    this.onSelectionChangeSource.next(this.selectedArtists);
  }

  deselectAll() {
    if (this.selectedArtists === []) {
      return;
    } else {
      this.selectedArtists = [];
      this.onSelectionChangeSource.next([]);
      this.showChipList = false;
    }
  }

  sortAlphabetically() {
    this.artists = _.sortBy(this.artists, artist => artist.name.toLowerCase());
    this.filter();
  }

  filter() {
    if (this.search !== '') {
      this.filteredArtists = _.filter(this.artists, artist => artist.name.toLowerCase().includes(this.search.toLowerCase()));
    } else {
      this.filteredArtists = this.artists;
    }
  }

  scrollTo(letter: string) {
    const scrollOptions = {block: 'start', inline: 'nearest', behavior: 'smooth'};
    if (letter === '#') {
      this.list.nativeElement.getElementsByClassName('artist')[0].scrollIntoView(scrollOptions);
      return;
    }
    const elem = _.find(this.list.nativeElement.getElementsByClassName('artist'), artist => {
      return artist.getElementsByClassName('artist-name')[0].innerText.toLowerCase().startsWith(letter.toLowerCase());
    });
    if (elem) {
      elem.scrollIntoView(scrollOptions);
    }
  }

}
