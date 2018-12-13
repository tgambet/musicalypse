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
import {MatDialog, MatMenu} from '@angular/material';
import {Observable} from 'rxjs';

import {Track} from '@app/model';
import {DetailsComponent} from '@app/shared/dialogs/details.component';
import {SettingsService} from '@app/settings/services/settings.service';
import {LibraryService} from '@app/library/services/library.service';

@Component({
  selector: 'app-tracks',
  template: `
    <div class="wrapper">

      <app-controls [(search)]="search"
                    [searchPlaceholder]="'Search a track'"
                    [matMenu]="tracksMenu"
                    [backButton]="true"
                    (backClicked)="previous.emit()">
        <span class="select-text">
          Total tracks: {{ filteredTracks.length }}
        </span>
      </app-controls>

      <mat-menu #tracksMenu>
        <button mat-menu-item (click)="addTracksToPlaylist()" [disabled]="filteredTracks.length == 0">
          <mat-icon>playlist_add</mat-icon>
          <span>Add all to current playlist</span>
        </button>
        <button mat-menu-item (click)="sortedAlphabetically = true" [disabled]="sortedAlphabetically">
          <mat-icon>sort_by_alpha</mat-icon>
          <span>Sort alphabetically</span>
        </button>
        <button mat-menu-item (click)="sortedAlphabetically = false" [disabled]="!sortedAlphabetically">
          <mat-icon>sort</mat-icon>
          <span>Sort by location</span>
        </button>
      </mat-menu>

      <div #list class="list-wrapper" (swiperight)="previous.emit()" (swipeleft)="next.emit()">
        <mat-list class="list" [class.sorted-alpha]="sortedAlphabetically" dense>
          <app-track *ngFor="let track of filteredTracks; trackBy: trackByURL"
                     [track]="track"
                     [isCurrentTrack]="isCurrentTrack(track)"
                     [search]="search"
                     [favorite]="isFavorite(track) | async"
                     (click)="trackClicked(track)"
                     (addTrackToPlaylist)="addTrackToPlaylist(track)"
                     (openDetailsDialog)="openDetailsDialog(track)"
                     (playTrack)="playTrack(track)"
                     (playTrackNext)="playTrackNext(track)"
                     (addToFavorites)="addToFavorites(track)"
                     (removeFromFavorites)="removeFromFavorites(track)">
          </app-track>
        </mat-list>
      </div>

      <app-dictionary *ngIf="sortedAlphabetically" (letterClicked)="scrollTo($event)"></app-dictionary>

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
      overflow-x: hidden;
      height: 100%;
    }
    .list {
      padding-top: 0;
    }
    .list.sorted-alpha {
      padding-right: 1rem;
    }
    .select-text {
      font-weight: 300;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TracksComponent implements OnChanges {

  @Output() next: EventEmitter<void> = new EventEmitter();
  @Output() previous: EventEmitter<void> = new EventEmitter();

  @Input() private tracks: Track[];
  @Input() currentTrack: Track;

  filteredTracks: Track[];

  @ViewChild('list') list: ElementRef;
  @ViewChild('tracksMenu') tracksMenu: MatMenu;

  private _search = '';
  get search() {
    return this._search;
  }
  set search(val: string) {
    this._search = val;
    this.filteredTracks = this.sort(this.tracks.filter(this.filter));
  }

  private _sortedAlphabetically = false;
  get sortedAlphabetically() {
    return this._sortedAlphabetically;
  }
  set sortedAlphabetically(val: boolean) {
    this._sortedAlphabetically = val;
    this.filteredTracks = this.sort(this.filteredTracks);
  }

  filter: (track: Track) => boolean = ((track: Track) => {
    if (this.search !== '') {
      return track.title.toLowerCase().includes(this.search.toLowerCase());
    }
    return true;
  });

  sort: (tracks: Track[]) => Track[] = ((tracks: Track[]) => {
    if (this.sortedAlphabetically) {
      return tracks.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
    } else {
      return tracks.sort((a, b) => a.location.localeCompare(b.location));
    }
  });

  constructor(
    private dialog: MatDialog,
    public settings: SettingsService,
    private library: LibraryService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tracks) {
      this.filteredTracks = this.sort(changes.tracks.currentValue.filter(this.filter));
    }
  }

  trackByURL(index: number, track: Track) {
    return track.url;
  }

  openDetailsDialog(track: Track) {
    const dialogRef = this.dialog.open(DetailsComponent, {
      // maxWidth: '500px',
      data: { track: track }
    });
    dialogRef.afterClosed().subscribe(() => {});
  }

  scrollTo(letter: string) {
    const scrollOptions: ScrollIntoViewOptions = { block: 'start', inline: 'nearest', behavior: 'smooth' };
    if (letter === '#') {
      this.list.nativeElement.getElementsByClassName('track')[0].scrollIntoView(scrollOptions);
      return;
    }
    const tracks: Element[] = Array.from(this.list.nativeElement.getElementsByClassName('track'));
    const elem = tracks.find(track => {
      return track.getElementsByClassName('track-name')[0].textContent.toLowerCase().startsWith(letter.toLowerCase());
    });
    if (elem) {
      elem.scrollIntoView(scrollOptions);
    }
  }

  trackClicked(track: Track) {
    this.next.emit();
    this.library.setPlaylist(this.tracks.filter(this.filter));
    this.library.playTrack(track);
  }

  addTrackToPlaylist(track: Track) {
    this.library.addToCurrentPlaylist([track]);
  }

  addTracksToPlaylist() {
    this.library.addToCurrentPlaylist(this.tracks.filter(this.filter));
  }

  playTrack(track: Track) {
    this.library.playTrack(track);
  }

  playTrackNext(track: Track) {
    this.library.playTrackNext(track);
  }

  isCurrentTrack(track: Track): boolean {
    if (!this.currentTrack) {
      return false;
    } else {
      return track.url === this.currentTrack.url;
    }
  }

  isFavorite(track: Track): Observable<boolean> {
    return this.library.isFavorite(track);
  }

  addToFavorites(track: Track) {
    this.library.addToFavorites(track);
  }

  removeFromFavorites(track: Track) {
    this.library.removeFromFavorites(track);
  }

}
