import {Component, Input, OnInit} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {AudioComponent} from '../audio/audio.component';
import {LibraryService} from '../../services/library.service';
import {environment} from '../../../environments/environment';
import {FavoritesService} from '../../services/favorites.service';
import {Track} from '../../model';
import {DetailsComponent} from '../../dialogs/details/details.component';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  @Input('audio')
  audio: AudioComponent;

  constructor(
    public library: LibraryService,
    public favorites: FavoritesService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  static getAudioUrl(sourceUrl: string) {
    if (environment.production) {
      return encodeURI(sourceUrl);
    } else {
      return `${window.location.protocol}//${window.location.hostname}:${environment.httpPort}${encodeURI(sourceUrl)}`;
    }
  }

  ngOnInit() {
    this.library.onTrackPlayed.subscribe(
      track => {
        this.audio.setSource(PlayerComponent.getAudioUrl(track.url));
        window.setTimeout(() => this.audio.play(), 0);
      }
    );
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
