import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Track} from '@app/model';
import {AudioService} from '@app/core/services/audio.service';
import {LibraryService} from '@app/library/services/library.service';

@Component({
  selector: 'app-mini-player',
  template: `
    <div class="mini-player" (click)="next.emit()">

      <mat-progress-bar [mode]="loading ? 'indeterminate' : 'determinate'" [value]="currentTime / duration * 100"></mat-progress-bar>

      <div class="avatar" [style]="getAvatarStyle(currentTrack)">
        <mat-icon *ngIf="!currentTrack || !currentTrack.coverUrl">music_note</mat-icon>
      </div>

      <div class="meta">
        <span class="title">{{ currentTrack ? currentTrack.metadata.title : '' }}</span>
        <span class="artist">{{ currentTrack ? currentTrack.metadata.artist : '' }}</span>
      </div>

      <div class="controls">
        <button mat-button mat-icon-button
                class="previous"
                (click)="playPrevious(); $event.stopPropagation()"
                [disabled]="!currentTrack || playlist.length <= 1">
          <mat-icon>skip_previous</mat-icon>
        </button>
        <button mat-button mat-icon-button
                class="playPause"
                [disabled]="!currentTrack"
                (click)="playing ? pause() : resume(); $event.stopPropagation()">
          <mat-icon>{{ playing ? 'pause' : 'play_arrow' }}</mat-icon>
        </button>
        <button mat-button mat-icon-button
                class="next"
                [disabled]="!currentTrack || playlist.length <= 1"
                (click)="playNext(); $event.stopPropagation()">
          <mat-icon>skip_next</mat-icon>
        </button>
      </div>

    </div>
  `,
  styles: [`
    .mini-player {
      width: 100%;
      box-sizing: border-box;
      cursor: pointer;
      padding: 1rem;
      display: flex;
      flex-direction: row;
      align-items: center;
      white-space: nowrap;
    }
    mat-progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }
    .avatar {
      box-sizing: content-box;
      width: 40px;
      height: 40px;
      margin-right: 1rem;
      border-radius: 50%;
      background-size: cover;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
    .meta {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .title {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .artist {
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 12px;
    }
    .controls {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .playPause {
      margin: 0 0.5rem;
    }
    .playPause mat-icon {
      font-size: 30px;
      height: 30px;
      width: 30px;
      line-height: 30px;
    }
    .next, .previous {
      height: 30px;
      width: 30px;
      line-height: 30px;
      font-size: 0;
    }
    .next mat-icon, .previous mat-icon {
      font-size: 20px;
      height: 20px;
      width: 20px;
      line-height: 20px;
    }
    .previous {
      display: none;
    }
    @media screen and (min-width: 599px) {
      .previous {
        display: inline-block;
      }
    }
  `]
})

export class MiniPlayerComponent implements OnInit {

  @Input() currentTrack: Track;
  @Input() playlist: Track[];
  @Input() playing: boolean;
  @Input() loading: boolean;
  @Input() volume: number;
  @Input() muted: boolean;
  @Input() duration: number;
  @Input() currentTime: number;

  @Output() next: EventEmitter<void> = new EventEmitter();

  constructor(
    private sanitizer: DomSanitizer,
    private audioService: AudioService,
    private library: LibraryService
  ) { }

  ngOnInit() {

  }

  getAvatarStyle(track: Track) {
    return track && track.coverUrl ? this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${track.coverUrl}")`) : '';
  }

  resume() {
    this.audioService.resume();
  }

  pause() {
    this.audioService.pause();
  }

  playPrevious() {
    this.library.playPreviousTrack();
  }

  playNext() {
    this.library.playNextTrack();
  }

}
