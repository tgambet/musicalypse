import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatSnackBar, MatTabGroup} from '@angular/material';
import {BreakpointObserver} from '@angular/cdk/layout';
import {AudioComponent} from '../../audio/audio.component';
import {LibraryService} from '../../services/library.service';
import {FavoritesService} from '../../services/favorites.service';
import {Track} from '../../model';
import {DetailsComponent} from '../../dialogs/details/details.component';
import {Subscription} from 'rxjs/Subscription';
import * as _ from 'lodash';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {

  @Output()
  onPrevious: EventEmitter<void> = new EventEmitter();

  @ViewChild('carousel')
  carousel: MatTabGroup;

  selectedCarouselIndex = 0;

  audio: AudioComponent;

  smallScreen: boolean;

  subscriptions: Subscription[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    public library: LibraryService,
    public favorites: FavoritesService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.audio = this.library.audio;

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
      this.onPrevious.emit();
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

}
