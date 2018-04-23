import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatTabGroup} from '@angular/material';
import {BreakpointObserver} from '@angular/cdk/layout';
import {FavoritesService} from '../../services/favorites.service';
import {Track} from '@app/model';
import {DetailsComponent} from '@app/shared/dialogs/details/details.component';
import {Observable, Subscription} from 'rxjs';
import * as _ from 'lodash';
import {AudioService} from '@app/core/services/audio.service';
import {LibraryService} from '@app/library/services/library.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent implements OnInit, OnDestroy {

  @Input() currentTrack: Track;
  @Input() playing: boolean;
  @Input() volume: number;
  @Input() muted: boolean;
  @Input() shuffle: boolean;
  @Input() repeat: boolean;
  @Input() playlist: Track[];

  loading$: Observable<boolean>;
  duration$: Observable<number>;
  currentTime$: Observable<number>;

  @Output()
  previous: EventEmitter<void> = new EventEmitter();

  @ViewChild('carousel')
  carousel: MatTabGroup;

  selectedCarouselIndex = 0;

  smallScreen: boolean;

  subscriptions: Subscription[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    public favorites: FavoritesService,
    // public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private audioService: AudioService,
    private library: LibraryService
  ) {
    this.loading$ = this.audioService.loading$;
    this.duration$ = this.audioService.duration$;
    this.currentTime$ = this.audioService.currentTime$;
  }

  ngOnInit() {
    this.subscriptions.push(
      this.breakpointObserver.observe('(max-width: 599px)').subscribe(result => {
        this.smallScreen = result.matches;
      })
    );
  }

  ngOnDestroy() {
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  trackByURL(index: number, track: Track) {
    return track.url;
  }

  swipeLeft() {
    if (this.selectedCarouselIndex < 2) {
      this.selectedCarouselIndex += 1;
    }
  }

  swipeRight() {
    if (this.selectedCarouselIndex > 0) {
      this.selectedCarouselIndex -= 1;
    } else {
      this.previous.emit();
    }
  }

  openDetailsDialog(track: Track) {
    const dialogRef = this.dialog.open(DetailsComponent, {
      // maxWidth: '500px',
      data: { track: track }
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
      console.log(result);
      // this.animal = result;
    });
  }

  resume() {
    this.audioService.resume();
  }

  pause() {
    this.audioService.pause();
  }

  seekTo(time: number) {
    this.audioService.seekTo(time);
  }

  setVolume(value: number) {
    this.audioService.setVolume(value);
  }

  mute() {
    this.audioService.mute();
  }

  unmute() {
    this.audioService.unmute();
  }

  clearPlaylist() {
    this.library.clearPlaylist();
  }

  playPrevious(): void {
    this.library.playPreviousTrack();
  }

  playNext() {
    this.library.playNextTrack();
  }

  setShuffle(value: boolean) {
    this.library.setShuffle(value);
  }

  setRepeat(value: boolean) {
    this.library.setRepeat(value);
  }

  playTrack(track: Track) {
    this.library.playTrack(track);
  }

}
