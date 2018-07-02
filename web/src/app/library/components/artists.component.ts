import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Observable} from 'rxjs';
import * as _ from 'lodash';

import {Artist} from '@app/model';

import {DisplayType} from '../library.component';
import {LibraryService} from '../services/library.service';
import {SettingsService} from '@app/settings/services/settings.service';

@Component({
  selector: 'app-artists',
  template: `
    <div class="wrapper">

      <app-chips [hidden]="!showChipList"
                 [list]="selectedArtists"
                 [displayProperty]="'name'"
                 (clickedElement)="scrollTo($event.name); showChipList = false"
                 (removedAll)="deselectAll()"
                 (removedElement)="deselect($event)">
      </app-chips>

      <app-controls [(search)]="search"
                    [searchPlaceholder]="'Search an artist'"
                    [backButton]="false">
        <span class="select-text" *ngIf="selectedArtists.length == 0">
          Select an artist or
          <mat-chip class="select-all" (click)="selectAll()">Select All</mat-chip>
        </span>
        <mat-chip-list *ngIf="selectedArtists.length > 0">
          <mat-chip *ngFor="let artist of selectedArtists.length <= 2 ? selectedArtists : selectedArtists.slice(0,1)"
                    (click)="scrollTo(artist.name)">
            <span class="chip-text">{{ artist.name }}</span>
            <mat-icon matChipRemove (click)="deselect(artist)">cancel</mat-icon>
          </mat-chip>
          <mat-chip *ngIf="selectedArtists.length > 2"
                    (click)="showChipList = !showChipList"
                    class="chip-more">
            <span class="chip-text">{{ selectedArtists.length - 1 }} more…</span>
          </mat-chip>
        </mat-chip-list>
      </app-controls>

      <div class="emptyMess fake-scroll-y" *ngIf="artists.length === 0">{{ getEmptyMessage() }}</div>

      <div #list class="list-wrapper" (swipeleft)="next.emit()">
        <mat-list class="list" dense>
          <app-list-item *ngFor="let artist of filteredArtists; trackBy: trackByName"
                         [selected]="isSelected(artist) | async"
                         [avatarStyle]="getAvatarStyle(artist)"
                         [warn]="artist.warn && settings.warnOnMissingTags"
                         [primaryHTML]="artist.name | sgSearch:search"
                         [secondaryHTML]="getSecondaryHTML(artist)"
                         (click)="select(artist); next.emit()"
                         (arrowClicked)="add(artist); next.emit()"
                         (checked)="$event ? add(artist) : deselect(artist)">
          </app-list-item>
        </mat-list>
      </div>

      <app-dictionary (letterClicked)="scrollTo($event)"></app-dictionary>

    </div>
  `,
  styles: [`
    .wrapper {
      padding-top: 60px;
      height: 100%;
      box-sizing: border-box;
    }
    .list-wrapper {
      overflow-y: scroll;
      height: 100%;
    }
    .list {
      padding-top: 0;
      padding-right: 1rem;
    }
    .select-text {
      font-weight: 300;
    }
    .select-text mat-chip {
      vertical-align: middle;
    }
    mat-chip-list {
      width: 100%;
    }
    mat-chip {
      cursor: pointer;
      font-size: 12px;
      max-width: calc(50% - 27px);
    }
    mat-chip:only-child {
      max-width: 100%;
    }
    .chip-text {
      white-space: nowrap;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .emptyMess {
      padding: 1rem;
      font-style: italic;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistsComponent implements OnChanges {

  @Output() next: EventEmitter<void> = new EventEmitter();

  @ViewChild('list') list: ElementRef;

  @Input() artists: Artist[];
  @Input() selectedArtists: Artist[];
  @Input() displayType: DisplayType;

  filteredArtists: Artist[];
  showChipList = false;

  _search = '';
  get search() {
    return this._search;
  }
  set search(val: string) {
    this._search = val;
    this.filteredArtists = this.artists.filter(this.filter);
  }

  filter = ((artist: Artist) => {
    if (this.search !== '') {
      return artist.name.toLowerCase().includes(this.search.toLowerCase());
    }
    return true;
  });

  constructor(
    public settings: SettingsService,
    private sanitizer: DomSanitizer,
    private library: LibraryService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.artists) {
      this.filteredArtists = changes.artists.currentValue.filter(this.filter);
    }
  }

  trackByName(index: number, artist: Artist) {
    return artist.name;
  }

  getAvatarStyle(artist: Artist) {
    return artist.avatarUrl ? this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${artist.avatarUrl}")`) : '';
  }

  getSecondaryHTML(artist: Artist) {
    switch (this.displayType) {
      case DisplayType.Default: {
        return artist.songs + ' songs';
      }
      case DisplayType.Recent: {
        return '<em>Recently played</em>';
      }
      case DisplayType.Favorites: {
        return '<em>Has favorites</em>';
      }
    }
  }

  getEmptyMessage() {
    switch (this.displayType) {
      case DisplayType.Default: {
        return '';
      }
      case DisplayType.Favorites: {
        return 'You don\'t have any favorite songs yet!';
      }
      case DisplayType.Recent: {
        return 'You haven\'t played any songs yet!';
      }
    }
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

  selectAll() {
    this.library.selectArtists(this.artists);
  }

  select(artist: Artist) {
    this.library.selectArtists([artist]);
    this.showChipList = false;
  }

  add(artist: Artist) {
    this.library.selectArtist(artist);
  }

  isSelected(artist: Artist): Observable<boolean> {
    return this.library.isSelectedArtist(artist);
  }

  deselect(artist: Artist) {
    this.library.deselectArtist(artist);
    if (this.selectedArtists.length < 4) {
      this.showChipList = false;
    }
  }

  deselectAll() {
    this.library.deselectAllArtists();
    this.showChipList = false;
  }

}
