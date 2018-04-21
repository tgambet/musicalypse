import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatSnackBar, MatTabGroup} from '@angular/material';
import {BreakpointObserver} from '@angular/cdk/layout';
import {LibraryService} from '../../services/library.service';
import {FavoritesService} from '../../services/favorites.service';
import {Track} from '@app/model';
import {DetailsComponent} from '@app/shared/dialogs/details/details.component';
import {Subscription} from 'rxjs';
import * as _ from 'lodash';
import {AudioService} from '@app/core/services/audio.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent implements OnInit, OnDestroy {

  @Input() currentTrack: Track;
  @Input() playing: boolean;
  @Input() loading: boolean;
  @Input() volume: number;
  @Input() muted: boolean;
  @Input() duration: number;
  @Input() currentTime: number;

  @Output()
  previous: EventEmitter<void> = new EventEmitter();

  @ViewChild('carousel')
  carousel: MatTabGroup;

  selectedCarouselIndex = 0;

  smallScreen: boolean;

  subscriptions: Subscription[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    public library: LibraryService,
    public favorites: FavoritesService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private audioService: AudioService
  ) {}

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

  clearPlaylist() {
    this.library.resetPlaylist();
    this.snackBar.open('Playlist cleared', '', { duration: 1500 });
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

  play() {
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

}
