/*
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Track} from '@app/model';

@Component({
  selector: 'app-player-status',
  template: `
    <div class="status-bar">
      <span class="status-position">{{ getCurrentTrackPosition() }}/{{ playlist.length }} tracks</span>
      <span class="status-total-time">Total duration: {{ getTotalDuration() | sgTime }}</span>
    </div>
  `,
  styles: [`
    .status-bar {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: .5rem 1rem .5rem 1rem;
      font-weight: 300;
    }
    .status-position {
    }
    .status-total-time {
      margin-left: auto;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerStatusComponent {

  @Input() playlist: Track[];
  @Input() currentTrack: Track;

  getTotalDuration(): number {
    return this.playlist.reduce((total, track) => total + track.metadata.duration, 0);
  }

  getCurrentTrackPosition(): number {
    if (this.currentTrack) {
      return this.playlist.findIndex(track => track.url === this.currentTrack.url) + 1;
    } else {
      return 0;
    }
  }

}
*/
