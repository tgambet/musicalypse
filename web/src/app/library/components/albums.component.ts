import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import * as _ from 'lodash';

import {Album} from '@app/model';

import {SettingsService} from '@app/settings/services/settings.service';

import {DeselectAlbum, DeselectAllAlbums, SelectAlbum, SelectAlbums, SelectAllAlbums} from '../actions/albums.actions';
import * as fromLibrary from '../library.reducers';

@Component({
  selector: 'app-albums',
  template: `
    <div class="wrapper">

      <app-chips [hidden]="!showChipList"
                 [list]="selectedAlbums"
                 [displayProperty]="'title'"
                 (clickedElement)="scrollTo($event.title); showChipList = false;"
                 (removedAll)="deselectAll()"
                 (removedElement)="deselect($event)">
      </app-chips>

      <app-controls [(search)]="search"
                    [searchPlaceholder]="'Search an album'"
                    [backButton]="true"
                    (backClicked)="previous.emit()">
        <span class="select-text" *ngIf="selectedAlbums.length == 0">
          Select an album or
          <mat-chip (click)="selectAll()">Select All</mat-chip>
        </span>
        <mat-chip-list *ngIf="selectedAlbums.length > 0">
          <mat-chip *ngFor="let album of selectedAlbums.length <= 2 ? selectedAlbums : selectedAlbums.slice(0,1)"
                    (click)="scrollTo(album.title)">
            <span class="chip-text">{{ album.title }}</span>
            <mat-icon matChipRemove (click)="deselect(album)">cancel</mat-icon>
          </mat-chip>
          <mat-chip *ngIf="selectedAlbums.length > 2"
                    (click)="showChipList = !showChipList"
                    class="chip-more">
            {{ selectedAlbums.length - 1 }} more…
          </mat-chip>
        </mat-chip-list>
      </app-controls>

      <div #list class="list-wrapper" (swiperight)="previous.emit()" (swipeleft)="next.emit()">
        <mat-list class="list" dense>
          <ng-container *ngFor="let album of albums.filter(filter); trackBy: trackByTitle">
            <app-list-item [selected]="isSelected(album) | async"
                           [avatarStyle]="getAvatarStyle(album)"
                           [warn]="album.warn && settings.warnOnMissingTags"
                           [primaryHTML]="album.title | sgSearch:search"
                           [secondaryHTML]="album.songs + ' songs • ' + album.artist"
                           (click)="select(album); next.emit()"
                           (arrowClicked)="add(album); next.emit()"
                           (checked)="$event ? add(album) : deselect(album)">
            </app-list-item>
          </ng-container>
        </mat-list>
      </div>

      <app-dictionary (letterClicked)="scrollTo($event)"></app-dictionary>

    </div>
  `,
  styles: [`
    .list-wrapper {
      overflow-y: scroll;
      height: 100%;
    }
    .list {
      padding-top: 0;
      padding-right: 1rem;
    }
    .wrapper {
      padding-top: 60px;
      height: 100%;
      box-sizing: border-box;
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
