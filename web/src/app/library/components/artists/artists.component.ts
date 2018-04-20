import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Artist} from '@app/model';
import {SettingsService} from '@app/settings/services/settings.service';
import {Subscription} from 'rxjs/Subscription';
import * as _ from 'lodash';
import * as fromLibrary from '@app/library/library.reducers';
import {Store} from '@ngrx/store';
import {DeselectAllArtists, DeselectArtist, SelectAllArtists, SelectArtist, SelectArtists} from '@app/library/actions/artists.actions';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-artists',
  templateUrl: './artists.component.html',
  styleUrls: ['../library/library.component.common.scss', './artists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistsComponent implements OnInit, OnDestroy {

  @Output() next: EventEmitter<void> = new EventEmitter();

  @ViewChild('list') list: ElementRef;

  @Input() artists: Artist[];
  @Input() selectedArtists: Artist[];

  showChipList = false;
  search = '';

  filter = ((artist: Artist) => {
    if (this.search !== '') {
      return artist.name.toLowerCase().includes(this.search.toLowerCase());
    }
    return true;
  });

  private subscriptions: Subscription[] = [];

  constructor(
    public settings: SettingsService,
    private sanitizer: DomSanitizer,
    private store: Store<fromLibrary.State>
  ) {}

  ngOnInit() {}

  ngOnDestroy(): void {
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  trackByName(index: number, artist: Artist) {
    return artist.name;
  }

  getAvatarStyle(artist: Artist) {
    return artist.avatarUrl ? this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${artist.avatarUrl}")`) : '';
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

  selectAllArtists() {
    this.store.dispatch(new SelectAllArtists());
  }

  selectArtist(artist: Artist) {
    this.store.dispatch(new SelectArtists([artist]));
  }

  addArtist(artist: Artist) {
    this.store.dispatch(new SelectArtist(artist));
  }

  isSelectedArtist(artist: Artist): Observable<boolean> {
    return this.store.select(fromLibrary.isSelectedArtist(artist));
  }

  deselect(artist: Artist) {
    this.store.dispatch(new DeselectArtist(artist));
  }

  deselectAll() {
    this.store.dispatch(new DeselectAllArtists());
  }

}
