import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatMenu} from '@angular/material';
import {Track} from '@app/model';
import {SettingsService} from '@app/settings/services/settings.service';
import {FavoritesService} from '../services/favorites.service';
import {DetailsComponent} from '@app/shared/dialogs/details/details.component';
import {Subscription} from 'rxjs';
import * as _ from 'lodash';
import {AudioService} from '@app/core/services/audio.service';
import {is} from 'immutable';
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
          Total tracks: {{ tracks.filter(filter).length }}
        </span>
      </app-controls>

      <mat-menu #tracksMenu>
        <button mat-menu-item (click)="addTracksToPlaylist()" [disabled]="tracks.filter(filter).length == 0">
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
          <ng-container *ngFor="let track of sort(tracks.filter(filter)).slice(0,300); trackBy: trackByURL">
            <app-track [track]="track"
                       [warn]="track.warn && settings.warnOnMissingTags"
                       [isCurrentTrack]="isCurrentTrack(track)"
                       [search]="search"
                       [playing]="audioService.playing$ | async"
                       [loading]="audioService.loading$ | async"
                       [favorite]="favorites.isFavorite(track)"
                       [currentTime]="audioService.currentTime$ | async"
                       [duration]="audioService.duration$ | async"
                       (click)="trackClicked(track)"
                       (addToFavorites)="favorites.addToFavorites(track)"
                       (addTrackToPlaylist)="addTrackToPlaylist(track)"
                       (audioPause)="pause()"
                       (audioPlay)="resume()"
                       (openDetailsDialog)="openDetailsDialog(track)"
                       (playTrack)="playTrack(track)"
                       (playTrackNext)="playTrackNext(track)"
                       (removeFromFavorites)="favorites.removeFromFavorites(track)">
            </app-track>
          </ng-container>
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
export class TracksComponent implements OnInit, OnDestroy {

  @Output() next: EventEmitter<void> = new EventEmitter();
  @Output() previous: EventEmitter<void> = new EventEmitter();

  @Input() tracks: Track[];
  @Input() currentTrack: Track;

  @ViewChild('list') list: ElementRef;
  @ViewChild('tracksMenu') tracksMenu: MatMenu;

  search = '';
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

  private subscriptions: Subscription[] = [];

  constructor(
    public favorites: FavoritesService,
    private dialog: MatDialog,
    public settings: SettingsService,
    public audioService: AudioService,
    private library: LibraryService
  ) { }

  ngOnInit() {}

  ngOnDestroy(): void {
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  trackByURL(index: number, track: Track) {
    return track.url;
  }

  // isMultipleAlbumsSelected(): boolean {
  //   return this.selectedAlbums.length > 1;
  // }

  // addAllToPlaylist() {
  //   this.library.addTracksToPlaylist(this.filteredTracks);
  //   const tracks = this.filteredTracks.length > 1 ? 'tracks' : 'track';
  //   this.snackBar.open(`${this.filteredTracks.length} ${tracks} added to current playlist`, '', { duration: 1500 });
  // }

  // addTrackToPlaylist(track: Track) {
  //   this.library.addTrackToPlaylist(track);
  //   this.snackBar.open('Track added to current playlist', '', { duration: 1500 });
  // }

  openDetailsDialog(track: Track) {
    const dialogRef = this.dialog.open(DetailsComponent, {
      // maxWidth: '500px',
      data: { track: track }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      // this.animal = result;
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

  resume() {
    this.audioService.resume();
  }

  pause() {
    this.audioService.pause();
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
    return is(track, this.currentTrack);
  }

}
