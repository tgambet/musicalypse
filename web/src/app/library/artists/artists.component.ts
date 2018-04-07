import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Artist} from '../../model';
import {LibraryService} from '../../services/library.service';
import {SettingsService} from '../../services/settings.service';
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

  private subscriptions: Subscription[] = [];

  constructor(
    public library: LibraryService,
    public settings: SettingsService,
    private sanitizer: DomSanitizer
  ) {}

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
      this.library.onReset.subscribe(() => { this.artists = []; this.filteredArtists = []; })
    );
    this.subscriptions.push(
      this.library.onArtistSelectionChanged.subscribe(artists => {
        if (artists.length < 3) {
          this.showChipList = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  trackByName(index: number, artist: Artist) {
    return artist.name;
  }

  getAvatarStyle(artist: Artist) {
    return artist.avatarUrl ? this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${artist.avatarUrl}")`) : '';
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
