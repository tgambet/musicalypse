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
import {Track} from '@app/model';
import {SettingsService} from '@app/settings/services/settings.service';
import {DetailsComponent} from '@app/shared/dialogs/details/details.component';
import * as _ from 'lodash';
import {LibraryService} from '@app/library/services/library.service';
import {Observable} from 'rxjs';

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
          <span>Sort by file name</span>
        </button>
      </mat-menu>

      <div #list class="list-wrapper" (swiperight)="previous.emit()" (swipeleft)="next.emit()">
        <mat-list class="list" [class.sorted-alpha]="sortedAlphabetically" dense>
          <app-track *ngFor="let track of filteredTracks.slice(0,300); trackBy: trackByURL"
                     [track]="track"
                     [warn]="track.warn && settings.warnOnMissingTags"
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

  _search = '';
  get search() {
    return this._search;
  }
  set search(val: string) {
    this._search = val;
    this.filteredTracks = this.sort(this.tracks.filter(this.filter));
  }

  sortedAlphabetically = false;

  filter: (track: Track) => boolean = ((track: Track) => {
    if (this.search !== '') {
      return track.metadata.title.toLowerCase().includes(this.search.toLowerCase());
    }
    return true;
  });

  sort: (tracks: Track[]) => Track[] = ((tracks: Track[]) => {
    if (this.sortedAlphabetically) {
      return _.sortBy(tracks, (track: Track) => track.metadata.title);
    } else {
      return tracks;
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

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
    });
  }

  scrollTo(letter: string) {
    const scrollOptions = {block: 'start', inline: 'nearest', behavior: 'smooth'};
    if (letter === '#') {
      this.list.nativeElement.getElementsByClassName('track')[0].scrollIntoView(scrollOptions);
      return;
    }
    const elem = _.find(this.list.nativeElement.getElementsByClassName('track'), artist => {
      return artist.getElementsByClassName('track-name')[0].innerText.toLowerCase().startsWith(letter.toLowerCase());
    });
    if (elem) {
      elem.scrollIntoView(scrollOptions);
    }
  }

  trackClicked(track: Track) {
    this.next.emit();
    this.library.setPlaylist(this.tracks.filter(this.filter).slice(0, 300));
    this.library.playTrack(track);
  }

  addTrackToPlaylist(track: Track) {
    this.library.addTracksToPlaylist([track]);
  }

  addTracksToPlaylist() {
    this.library.addTracksToPlaylist(this.tracks.filter(this.filter).slice(0, 300));
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
