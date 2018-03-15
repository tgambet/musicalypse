import {Component, Input, OnInit} from '@angular/core';
import {AudioComponent} from '../audio/audio.component';
import {Track} from '../model';
import {LibraryService} from '../services/library.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  @Input('audio')
  audio: AudioComponent;
  @Input('track')
  track: Track;

  constructor(public libraryService: LibraryService) {}

  ngOnInit() {
  }

}
