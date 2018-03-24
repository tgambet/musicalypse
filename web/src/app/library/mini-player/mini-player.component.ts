import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {LibraryService} from '../../services/library.service';
import {AudioComponent} from '../../audio/audio.component';

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrls: ['./mini-player.component.scss']
})
export class MiniPlayerComponent implements OnInit {

  @Output()
  onNext: EventEmitter<void> = new EventEmitter();

  audio: AudioComponent;

  constructor(
    public library: LibraryService
  ) { }

  ngOnInit() {
    this.audio = this.library.audio;
  }

}
