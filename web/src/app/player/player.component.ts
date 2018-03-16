import {Component, Input, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {AudioComponent} from '../audio/audio.component';
import {LibraryService} from '../services/library.service';
import {environment} from '../../environments/environment';
import {FavoritesService} from '../services/favorites.service';

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
    public snackBar: MatSnackBar
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

}
