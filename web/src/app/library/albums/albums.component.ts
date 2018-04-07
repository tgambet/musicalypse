import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Album} from '../../model';
import {LibraryService} from '../../services/library.service';
import {SettingsService} from '../../services/settings.service';
import {Subscription} from 'rxjs/Subscription';
import * as _ from 'lodash';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['../library.component.common.scss', './albums.component.scss']
})
export class AlbumsComponent implements OnInit, OnDestroy {

  @Output()
  onNext: EventEmitter<void> = new EventEmitter();
  @Output()
  onPrevious: EventEmitter<void> = new EventEmitter();

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
  albums: Album[] = [];
  filteredAlbums: Album[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    public library: LibraryService,
    public settings: SettingsService,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit() {
    // Subscribe to selection changes
    this.subscriptions.push(
      this.library.onArtistSelectionChanged.subscribe(artists => {
        this.albums = this.library.getAlbumsOf(artists);
        this.sortAlphabetically();
        this.library.filterSelectedAlbums(artists);
        if (this.library.selectedAlbums.length < 3) {
          this.showChipList = false;
        }
      })
    );
    // Subscribe to new tracks and library reset
    this.subscriptions.push(
      this.library.onTrackAdded.subscribe(() => {
        this.albums = this.library.getAlbumsOf(this.library.selectedArtists);
        this.sortAlphabetically();
      })
    );
    this.subscriptions.push(
      this.library.onReset.subscribe(() => { this.albums = []; this.filteredAlbums = []; })
    );
  }

  ngOnDestroy(): void {
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  trackByTitle(index: number, album: Album) {
    return album.title;
  }

  getAvatarStyle(album: Album) {
    return album.avatarUrl ? this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${album.avatarUrl}")`) : '';
  }

  sortAlphabetically() {
    this.albums = _.sortBy(this.albums, album => album.title.toLowerCase());
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
    return this.library.selectedArtists.length > 1;
  }

  scrollTo(letter: string) {
    const scrollOptions = {block: 'start', inline: 'nearest', behavior: 'smooth'};
    if (letter === '#') {
      this.list.nativeElement.getElementsByClassName('album')[0].scrollIntoView(scrollOptions);
      return;
    }
    const elem = _.find(this.list.nativeElement.getElementsByClassName('album'), artist => {
      return artist.getElementsByClassName('album-name')[0].innerText.toLowerCase().startsWith(letter.toLowerCase());
    });
    if (elem) {
      elem.scrollIntoView(scrollOptions);
    }
  }

}
