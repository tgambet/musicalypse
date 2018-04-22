import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatMenu} from '@angular/material';
import {Track} from '@app/model';
import {LibraryService} from '../services/library.service';
import {SettingsService} from '@app/settings/services/settings.service';
import {FavoritesService} from '../services/favorites.service';
import {DetailsComponent} from '@app/shared/dialogs/details/details.component';
import {Subscription} from 'rxjs';
import * as _ from 'lodash';
import {AudioService} from '@app/core/services/audio.service';

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
        <button mat-menu-item (click)="library.addTracksToPlaylist(tracks.filter(filter))" [disabled]="tracks.filter(filter).length == 0">
          <mat-icon>playlist_add</mat-icon>
          <span>Add all to current playlist</span>
        </button>
        <!--<button mat-menu-item (click)="library.sortTracks(true)" [disabled]="library.sortTracksAlphabetically">-->
        <!--<mat-icon>sort_by_alpha</mat-icon>-->
        <!--<span>Sort alphabetically</span>-->
        <!--</button>-->
        <!--<button mat-menu-item (click)="library.sortTracks(false)" [disabled]="!library.sortTracksAlphabetically">-->
        <!--<mat-icon>sort</mat-icon>-->
        <!--<span>Sort by file name</span>-->
        <!--</button>-->
      </mat-menu>

      <div #list class="list-wrapper" (swiperight)="previous.emit()" (swipeleft)="next.emit()">
        <mat-list class="list" [class.sorted-alpha]="library.sortTracksAlphabetically" dense>
          <ng-container *ngFor="let track of tracks.filter(filter).slice(0,300); trackBy: trackByURL">
            <app-track [track]="track"
                       [warn]="track.warn && settings.warnOnMissingTags"
                       [currentTrack]="track.url === (library.currentTrack ? library.currentTrack.url : '')"
                       [search]="search"
                       [playing]="audioService.playing$ | async"
                       [loading]="audioService.loading$ | async"
                       [favorite]="favorites.isFavorite(track)"
                       [currentTime]="audioService.currentTime$ | async"
                       [duration]="audioService.duration$ | async"
                       (click)="library.playTracks(tracks.filter(filter), track); next.emit()"
                       (addToFavorites)="favorites.addToFavorites(track)"
                       (addTrackToPlaylist)="library.addTrackToPlaylist(track)"
                       (audioPause)="pause()"
                       (audioPlay)="play()"
                       (openDetailsDialog)="openDetailsDialog(track)"
                       (playTrack)="library.playTrack(track)"
                       (playTrackNext)="library.playTrackNext(track)"
                       (removeFromFavorites)="favorites.removeFromFavorites(track)">
            </app-track>
          </ng-container>
        </mat-list>
      </div>

      <app-dictionary *ngIf="library.sortTracksAlphabetically" (letterClicked)="scrollTo($event)"></app-dictionary>

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

  @ViewChild('list') list: ElementRef;
  @ViewChild('tracksMenu') tracksMenu: MatMenu;

  search = '';

  filter: (track: Track) => boolean = ((track: Track) => {
    if (this.search !== '') {
      return track.metadata.title.toLowerCase().includes(this.search.toLowerCase());
    }
    return true;
  });

  private subscriptions: Subscription[] = [];

  constructor(
    public library: LibraryService,
    public favorites: FavoritesService,
    public dialog: MatDialog,
    public settings: SettingsService,
    public audioService: AudioService
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

  play() {
    this.audioService.resume();
  }

  pause() {
    this.audioService.pause();
  }

}
