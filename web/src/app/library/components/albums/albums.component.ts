import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Album} from '@app/model';
import {LibraryService} from '../../services/library.service';
import {SettingsService} from '@app/settings/services/settings.service';
import {Subscription} from 'rxjs/Subscription';
import * as _ from 'lodash';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['../library/library.component.common.scss', './albums.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumsComponent implements OnInit, OnDestroy {

  @Output() next: EventEmitter<void> = new EventEmitter();
  @Output() previous: EventEmitter<void> = new EventEmitter();

  @Input() albums: Album[];
  @Input() selectedAlbums: Album[];

  @ViewChild('list')
  list: ElementRef;

  showChipList = false;
  search = '';

  // filter: (albums: Album[]) => Album[] = ((albums: Album[]) => {
  //   if (this.search !== '') {
  //     return _.filter(albums, album => album.title.toLowerCase().includes(this.search.toLowerCase()));
  //   }
  //   return albums;
  // });

  filter = ((album: Album) => {
    if (this.search !== '') {
      return album.title.toLowerCase().includes(this.search.toLowerCase());
    }
    return true;
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

  scrollTo(letter: string) {
    const scrollOptions = {block: 'start', inline: 'nearest', behavior: 'smooth'};
    if (letter === '#') {
      this.list.nativeElement.getElementsByClassName('list-item')[0].scrollIntoView(scrollOptions);
      return;
    }
    const elem = _.find(this.list.nativeElement.getElementsByClassName('list-item'), artist => {
      return artist.getElementsByClassName('item-name')[0].innerText.toLowerCase().startsWith(letter.toLowerCase());
    });
    if (elem) {
      elem.scrollIntoView(scrollOptions);
    }
  }

  deselect(album: Album) {
    this.library.deselectAlbum(album);
    if (this.library.selectedAlbums.length < 3) {
      this.showChipList = false;
    }
  }

  deselectAll() {
    this.library.deselectAllAlbums();
    this.showChipList = false;
  }

}
