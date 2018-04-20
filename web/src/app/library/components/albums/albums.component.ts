import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Album} from '@app/model';
import {LibraryService} from '../../services/library.service';
import {SettingsService} from '@app/settings/services/settings.service';
import * as _ from 'lodash';
import {Observable} from 'rxjs';
import * as fromLibrary from '@app/library/library.reducers';
import {Store} from '@ngrx/store';
import {DeselectAlbum, DeselectAllAlbums, SelectAlbum, SelectAlbums, SelectAllAlbums} from '@app/library/actions/albums.actions';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['../library/library.component.common.scss', './albums.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumsComponent {

  @Output() next: EventEmitter<void> = new EventEmitter();
  @Output() previous: EventEmitter<void> = new EventEmitter();

  @Input() albums: Album[];
  @Input() selectedAlbums: Album[];

  @ViewChild('list')
  list: ElementRef;

  showChipList = false;
  search = '';

  filter = ((album: Album) => {
    if (this.search !== '') {
      return album.title.toLowerCase().includes(this.search.toLowerCase());
    }
    return true;
  });

  constructor(
    public library: LibraryService,
    public settings: SettingsService,
    private sanitizer: DomSanitizer,
    private store: Store<fromLibrary.State>
  ) {
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
    const elem = _.find(this.list.nativeElement.getElementsByClassName('list-item'), album => {
      return album.getElementsByClassName('item-name')[0].innerText.toLowerCase().startsWith(letter.toLowerCase());
    });
    if (elem) {
      elem.scrollIntoView(scrollOptions);
    }
  }

  selectAll() {
    this.store.dispatch(new SelectAllAlbums());
  }

  select(album: Album) {
    this.store.dispatch(new SelectAlbums([album]));
    this.showChipList = false;
  }

  add(album: Album) {
    this.store.dispatch(new SelectAlbum(album));
  }

  isSelected(album: Album): Observable<boolean> {
    return this.store.select(fromLibrary.isSelectedAlbum(album));
  }

  deselect(album: Album) {
    this.store.dispatch(new DeselectAlbum(album));
    if (this.selectedAlbums.length < 4) {
      this.showChipList = false;
    }
  }

  deselectAll() {
    this.store.dispatch(new DeselectAllAlbums());
    this.showChipList = false;
  }

}
