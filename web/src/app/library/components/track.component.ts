import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {Track} from '@app/model';
import {AudioService} from '@app/core/services/audio.service';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {take} from 'rxjs/internal/operators';

@Component({
  selector: 'app-track',
  template: `
    <a mat-list-item class="track hover">
      <div matLine class="primary-text">
        <mat-icon *ngIf="warn" color="warn" matTooltip="Unset tags!">warning</mat-icon>
        <mat-icon color="warn" class="favorite-icon" *ngIf="favorite">favorite</mat-icon>
        <span class="track-name" [innerHtml]="track.metadata.title | sgSearch:search"></span>
      </div>
      <div matLine class="secondary-text">
        {{ track.metadata.duration | sgTime }} • {{ track.metadata.album }}
      </div>
      <button mat-button mat-icon-button
              class="more"
              *ngIf="!isCurrentTrack"
              [matMenuTriggerFor]="trackMenu"
              (click)="$event.stopPropagation()">
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu #trackMenu>
        <button mat-menu-item (click)="playTrack.emit()">
          <mat-icon>play_arrow</mat-icon>
          <span>Play</span>
        </button>
        <button mat-menu-item (click)="playTrackNext.emit()">
          <mat-icon>play_arrow</mat-icon>
          <span>Play next</span>
        </button>
        <button mat-menu-item (click)="addTrackToPlaylist.emit()">
          <mat-icon>playlist_add</mat-icon>
          <span>Add to current playlist</span>
        </button>
        <button mat-menu-item [matMenuTriggerFor]="playlistsMenu" disabled>
          <mat-icon>playlist_add</mat-icon>
          <span>Add to playlist</span>
        </button>
        <button mat-menu-item (click)="addToFavorites.emit()" *ngIf="!favorite">
          <mat-icon>favorite_border</mat-icon>
          <span>Add to favorites</span>
        </button>
        <button mat-menu-item (click)="removeFromFavorites.emit()" *ngIf="favorite">
          <mat-icon>favorite</mat-icon>
          <span>Remove from favorites</span>
        </button>
        <button mat-menu-item (click)="openDetailsDialog.emit()">
          <mat-icon>details</mat-icon>
          <span>Details</span>
        </button>
      </mat-menu>
      <mat-menu #playlistsMenu="matMenu">
        <button mat-menu-item>
          <mat-icon>add</mat-icon>
          New playlist
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item>
          <mat-icon>album</mat-icon>
          Playlist1
        </button>
        <button mat-menu-item>
          <mat-icon>album</mat-icon>
          Playlist2
        </button>
      </mat-menu>
      <app-track-control *ngIf="isCurrentTrack"></app-track-control>
      <mat-divider></mat-divider>
    </a>
  `,
  styles: [`
    .track {
      cursor: pointer;
    }

    .favorite-icon {
      height: 14px;
      width: 14px;
      font-size: 14px;
      line-height: 14px;
      vertical-align: text-bottom;
    }
    .primary-text {
      font-size: 14px !important;
    }
    .primary-text mat-icon {
      height: 14px;
      width: 14px;
      font-size: 14px;
      line-height: 14px;
      vertical-align: text-bottom;
    }
    .secondary-text {
      font-size: 12px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackComponent {

  @Input() track: Track;
  @Input() isCurrentTrack: boolean;
  @Input() warn: boolean;
  @Input() favorite: boolean;
  @Input() search: string;

  @Output() playTrack = new EventEmitter<void>();
  @Output() playTrackNext = new EventEmitter<void>();
  @Output() addTrackToPlaylist = new EventEmitter<void>();
  @Output() addToFavorites = new EventEmitter<void>();
  @Output() removeFromFavorites = new EventEmitter<void>();
  @Output() openDetailsDialog = new EventEmitter<void>();

}

@Component({
  selector: 'app-track-control',
  template: `
    <button mat-button mat-icon-button
            class="playPause"
            (click)="playPause(); $event.stopPropagation()">
      <mat-icon>{{ (playing$ | async) ? 'pause' : 'play_arrow' }}</mat-icon>
    </button>
    <span class="spinner">
      <mat-progress-spinner [diameter]="40"
                            [mode]="(loading$ | async) ? 'indeterminate' : 'determinate'"
                            [value]="(currentTime$ | async) / (duration$ | async) * 100">
      </mat-progress-spinner>
    </span>
  `,
  styles: [`
    .spinner {
      display: inline-block;
      height: 40px;
      width: 40px;
      position: absolute;
      right: 0.5rem;
      z-index: 1;
    }
    .playPause {
      position: relative;
      z-index: 2;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackControlComponent {

  currentTime$: Observable<number>;
  duration$: Observable<number>;
  playing$: Observable<boolean>;
  loading$: Observable<boolean>;

  constructor(
    private audio: AudioService
  ) {
    this.currentTime$ = this.audio.currentTime$;
    this.duration$ = this.audio.duration$;
    this.playing$ = this.audio.playing$;
    this.loading$ = this.audio.loading$;
  }

  play() {
    this.audio.resume();
  }

  pause() {
    this.audio.pause();
  }

  playPause() {
    this.playing$.pipe(
      take(1),
      tap(playing => playing ? this.pause() : this.play())
    ).subscribe();
  }

}
