import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Playlist, Track} from '@app/model';

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
      <button mat-button mat-icon-button [matMenuTriggerFor]="playerMenu" class="more">
        <mat-icon>more_horiz</mat-icon>
      </button>
      <mat-menu #playerMenu="matMenu">
        <button mat-menu-item [matMenuTriggerFor]="LoadPlaylist" [disabled]="playlists.length === 0">
          <mat-icon>playlist_play</mat-icon>
          <span>Load playlist</span>
        </button>
        <button mat-menu-item [matMenuTriggerFor]="AddToPlaylist" [disabled]="playlists.length == 0">
          <mat-icon>playlist_add</mat-icon>
          <span>Add all to playlist</span>
        </button>
        <button mat-menu-item (click)="showInLibrary.emit()" [disabled]="playlist.length == 0">
          <mat-icon>queue_music</mat-icon>
          <span>Select in library</span>
        </button>
        <button mat-menu-item (click)="clearPlaylist.emit()" [disabled]="playlist.length == 0">
          <mat-icon>delete</mat-icon>
          <span>Clear playlist</span>
        </button>
        <button mat-menu-item (click)="savePlaylist.emit()" [disabled]="playlist.length == 0">
          <mat-icon>save</mat-icon>
          <span>Save playlist</span>
        </button>
      </mat-menu>
      <mat-menu #LoadPlaylist="matMenu">
        <ng-container *ngFor="let pl of playlists">
          <button mat-menu-item (click)="loadPlaylist.emit(pl)">
            <mat-icon>album</mat-icon>
            {{pl.name}}
          </button>
        </ng-container>
      </mat-menu>
      <mat-menu #AddToPlaylist="matMenu">
        <!--<button mat-menu-item disabled>-->
        <!--<mat-icon>add</mat-icon>-->
        <!--New playlist-->
        <!--</button>-->
        <!--<mat-divider></mat-divider>-->
        <ng-container *ngFor="let pl of playlists">
          <button mat-menu-item (click)="addAllToPlaylist.emit(pl)">
            <mat-icon>album</mat-icon>
            {{pl.name}}
          </button>
        </ng-container>
      </mat-menu>
      <div class="filler"></div>
      <mat-slider
        [disabled]="muted"
        [value]="volume"
        (input)="setVolume.emit($event.value)"
        [max]="1"
        [step]="0.01"
        color="primary"
        class="volume-slider"></mat-slider>
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
      padding: 0.5rem 1rem 0.5rem 1rem;
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
    .volume-slider, .mute {
      display: none;
    }
    @media screen and (min-width: 599px) {
      .volume-slider, .mute {
        display: unset;
      }
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
  @Input() playlists: Playlist[] = [];

  @Output() setShuffle = new EventEmitter<boolean>();
  @Output() setRepeat = new EventEmitter<boolean>();
  @Output() playPrevious = new EventEmitter<void>();
  @Output() playNext = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() resume = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<Track>();
  @Output() setVolume = new EventEmitter<number>();
  @Output() setMute = new EventEmitter<boolean>();
  @Output() showInLibrary = new EventEmitter<void>();
  @Output() clearPlaylist = new EventEmitter<void>();
  @Output() savePlaylist = new EventEmitter<void>();
  @Output() loadPlaylist = new EventEmitter<Playlist>();
  @Output() addAllToPlaylist = new EventEmitter<Playlist>();

}
