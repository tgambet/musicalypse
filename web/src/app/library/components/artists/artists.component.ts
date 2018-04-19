import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Artist} from '@app/model';
import {LibraryService} from '../../services/library.service';
import {SettingsService} from '@app/settings/services/settings.service';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import * as _ from 'lodash';

@Component({
  selector: 'app-artists',
  templateUrl: './artists.component.html',
  styleUrls: ['../library/library.component.common.scss', './artists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistsComponent implements OnInit, OnDestroy {

  @Output()
  next: EventEmitter<void> = new EventEmitter();

  @ViewChild('list') list: ElementRef;

  @Input() artists: Observable<Artist[]>;
  @Input() selectedArtists: Artist[];

  showChipList = false;
  search = '';

  filter: (artists: Artist[]) => Artist[] = ((artists: Artist[]) => {
    if (this.search !== '') {
      return _.filter(artists, artist => artist.name.toLowerCase().includes(this.search.toLowerCase()));
    }
    return artists;
  });

  private subscriptions: Subscription[] = [];

  constructor(
    public library: LibraryService,
    public settings: SettingsService,
    private sanitizer: DomSanitizer
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

  deselect(artist: Artist) {
    this.library.deselectArtist(artist);
    if (this.library.selectedArtists.length < 3) {
      this.showChipList = false;
    }
  }

  deselectAll() {
    this.library.deselectAllArtists();
    this.showChipList = false;
  }

}
