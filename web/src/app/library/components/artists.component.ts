import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import * as _ from 'lodash';

import {Artist} from '@app/model';

import {SettingsService} from '@app/settings/services/settings.service';

import {DeselectAllArtists, DeselectArtist, SelectAllArtists, SelectArtist, SelectArtists} from '../actions/artists.actions';
import * as fromLibrary from '../library.reducers';

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
          <mat-chip (click)="selectAll()">Select All</mat-chip>
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

      <div #list class="list-wrapper" (swipeleft)="next.emit()">
        <mat-list class="list" dense>
          <ng-container *ngFor="let artist of artists.filter(filter); trackBy: trackByName">
            <app-list-item [selected]="isSelected(artist) | async"
                           [avatarStyle]="getAvatarStyle(artist)"
                           [warn]="artist.warn && settings.warnOnMissingTags"
                           [primaryHTML]="artist.name | sgSearch:search"
                           [secondaryHTML]="artist.songs + ' songs'"
                           (click)="select(artist); next.emit()"
                           (arrowClicked)="add(artist); next.emit()"
                           (checked)="$event ? add(artist) : deselect(artist)">
            </app-list-item>
          </ng-container>
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
    mat-chip-list {
      width: 100%;
    }
    mat-chip {
      cursor: pointer;
      font-size: 12px;
      max-width: calc(50% - 16px);
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistsComponent {

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

  constructor(
    public settings: SettingsService,
    private sanitizer: DomSanitizer,
    private store: Store<fromLibrary.State>
  ) {}

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

  selectAll() {
    this.store.dispatch(new SelectAllArtists());
  }

  select(artist: Artist) {
    this.store.dispatch(new SelectArtists([artist]));
    this.showChipList = false;
  }

  add(artist: Artist) {
    this.store.dispatch(new SelectArtist(artist));
  }

  isSelected(artist: Artist): Observable<boolean> {
    return this.store.select(fromLibrary.isSelectedArtist(artist));
  }

  deselect(artist: Artist) {
    this.store.dispatch(new DeselectArtist(artist));
    if (this.selectedArtists.length < 4) {
      this.showChipList = false;
    }
  }

  deselectAll() {
    this.store.dispatch(new DeselectAllArtists());
    this.showChipList = false;
  }

}
