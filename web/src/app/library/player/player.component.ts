import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {AudioComponent} from '../../audio/audio.component';
import {LibraryService} from '../../services/library.service';
import {FavoritesService} from '../../services/favorites.service';
import {Track} from '../../model';
import {DetailsComponent} from '../../dialogs/details/details.component';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  @Output()
  onPrevious: EventEmitter<void> = new EventEmitter();

  audio: AudioComponent;

  constructor(
    public library: LibraryService,
    public favorites: FavoritesService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.audio = this.library.audio;
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
