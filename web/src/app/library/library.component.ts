import {Component, OnInit, ViewChild} from '@angular/core';
import {AudioComponent} from './audio/audio.component';
import {LibraryService} from '../services/library.service';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {

  @ViewChild(AudioComponent)
  audio: AudioComponent;

  constructor(
    public library: LibraryService
  ) { }

  ngOnInit() {
  }

  onPlayEnded() {
    // if repeat is on or it is not the last song
    if (this.library.playlist.length > 0 && (this.library.repeat || !this.library.isCurrentTrackLastInPlaylist())) {
      this.library.playNextTrackInPlaylist();
    } else {
      this.library.currentTrack = null;
      this.audio.setSource('');
    }
  }

}
