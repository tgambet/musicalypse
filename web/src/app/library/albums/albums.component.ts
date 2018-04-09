import {
  ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Album} from '../../model';
import {LibraryService} from '../../services/library.service';
import {SettingsService} from '../../services/settings.service';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import * as _ from 'lodash';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['../library.component.common.scss', './albums.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumsComponent implements OnInit, OnDestroy {

  @Output()
  onNext: EventEmitter<void> = new EventEmitter();
  @Output()
  onPrevious: EventEmitter<void> = new EventEmitter();

  @Input('albums')
  albums: Observable<Album[]>;
  @Input('selectedAlbums')
  selectedAlbums: Album[];

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

  filter: (albums: Album[]) => Album[] = ((albums: Album[]) => {
    if (this.search !== '') {
      return _.filter(albums, album => album.title.toLowerCase().includes(this.search.toLowerCase()));
    }
    return albums;
  });

  private subscriptions: Subscription[] = [];

  constructor(
    public library: LibraryService,
    public settings: SettingsService,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  trackByTitle(index: number, album: Album) {
    return album.title + album.artist;
  }

  getAvatarStyle(album: Album) {
    return album.avatarUrl ? this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${album.avatarUrl}")`) : '';
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
