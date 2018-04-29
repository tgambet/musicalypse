import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Track} from '@app/model';

@Component({
  selector: 'app-player-controls',
  template: `
    <div class="controls">
      <button mat-button mat-icon-button
              class="previous"
              (click)="playPrevious.emit()"
              [disabled]="!currentTrack || playlist.length <= 1">
        <mat-icon>skip_previous</mat-icon>
      </button>
      <button mat-button mat-icon-button
              class="playPause"
              [disabled]="playlist.length === 0 && !currentTrack"
              (click)="playing ? pause.emit() : (currentTrack ? resume.emit() : playNext.emit())">
        <mat-icon>{{ playing ? 'pause' : 'play_arrow' }}</mat-icon>
      </button>
      <button mat-button mat-icon-button
              class="next"
              (click)="playNext.emit()"
              [disabled]="!currentTrack || playlist.length <= 1">
        <mat-icon>skip_next</mat-icon>
      </button>
      <button mat-button mat-icon-button
              class="shuffle"
              [color]="shuffle ? 'primary' : ''"
              (click)="setShuffle.emit(!shuffle)">
        <mat-icon>shuffle</mat-icon>
      </button>
      <button mat-button mat-icon-button
              class="repeat"
              [color]="repeat ? 'primary' : ''"
              (click)="setRepeat.emit(!repeat)">
        <mat-icon>repeat</mat-icon>
      </button>
      <button mat-button mat-icon-button
              class="favorites"
              [disabled]="!currentTrack"
              [color]="isFavorite ? 'warn' : ''"
              (click)="toggleFavorite.emit(currentTrack)">
        <mat-icon>{{ isFavorite ? 'favorite' : 'favorite_border' }}</mat-icon>
      </button>
      <!--<button mat-button mat-icon-button [matMenuTriggerFor]="playerMenu" class="more">-->
        <!--<mat-icon>more_horiz</mat-icon>-->
      <!--</button>-->
      <div class="filler"></div>
      <mat-slider
        [disabled]="muted"
        [value]="volume"
        (input)="setVolume.emit($event.value)"
        [max]="1"
        [step]="0.01"
        color="primary"></mat-slider>
      <button mat-button mat-icon-button
              class="mute"
              (click)="setMute.emit(!muted)">
        <mat-icon *ngIf="!muted && volume > 0.50">volume_up</mat-icon>
        <mat-icon *ngIf="!muted && volume > 0 && volume <= 0.50">volume_down</mat-icon>
        <mat-icon *ngIf="!muted && volume == 0">volume_mute</mat-icon>
        <mat-icon *ngIf="muted">volume_off</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .controls {
      padding: 0.5rem 1rem 0 1rem;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    button:not(:last-child), mat-slider {
      margin-right: 0.5rem;
    }
    .filler {
      flex-grow: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerControlsComponent {

  @Input() volume: number;
  @Input() muted: boolean;
  @Input() playing: boolean;
  @Input() repeat: boolean;
  @Input() shuffle: boolean;
  @Input() isFavorite: boolean;
  @Input() currentTrack: Track;
  @Input() playlist: Track[];

  @Output() setShuffle = new EventEmitter<boolean>();
  @Output() setRepeat = new EventEmitter<boolean>();
  @Output() playPrevious = new EventEmitter<void>();
  @Output() playNext = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() resume = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<Track>();
  @Output() setVolume = new EventEmitter<number>();
  @Output() setMute = new EventEmitter<boolean>();

}
