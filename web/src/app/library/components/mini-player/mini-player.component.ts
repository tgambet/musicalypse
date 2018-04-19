import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {LibraryService} from '../../services/library.service';
import {Track} from '@app/model';
import {AudioService} from '@app/core/services/audio.service';

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrls: ['./mini-player.component.scss']
})
export class MiniPlayerComponent implements OnInit {

  @Input() currentTrack: Track;
  @Input() playing: boolean;
  @Input() loading: boolean;
  @Input() volume: number;
  @Input() muted: boolean;
  @Input() duration: number;
  @Input() currentTime: number;

  @Output() next: EventEmitter<void> = new EventEmitter();

  constructor(
    public library: LibraryService,
    private sanitizer: DomSanitizer,
    private audioService: AudioService
  ) { }

  ngOnInit() {

  }

  getAvatarStyle(track: Track) {
    return track && track.coverUrl ? this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${track.coverUrl}")`) : '';
  }

  play() {
    this.audioService.resume();
  }

  pause() {
    this.audioService.pause();
  }

}
