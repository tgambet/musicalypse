import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Track} from '@app/model';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-player-header',
  template: `
    <div class="header">
      <div class="cover"
           [style]="getAvatarStyle(currentTrack)"
           [class.no-art]="!currentTrack || !currentTrack.coverUrl">
        <mat-icon *ngIf="!currentTrack || !currentTrack.coverUrl">music_note</mat-icon>
      </div>
      <div class="meta">
        <span class="title" *ngIf="currentTrack">
          {{ currentTrack.title }}
        </span>
        <span class="artist-album" *ngIf="currentTrack">
          {{ currentTrack.artist }} • {{ currentTrack.album }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .header {
      padding: 1rem;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .cover {
      height: 100px;
      min-width: 100px;
      margin-right: 1rem;
      background-size: cover;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cover mat-icon {
      height: 50px;
      width: 50px;
      line-height: 50px;
      font-size: 50px;
    }
    .meta {
      display: flex;
      flex-direction: column;
    }
    .title {
      font-size: 25px;
      line-height: 25px;
      font-weight: 500;
      margin-bottom: 1rem;
    }
    .artist-album {
      font-size: 15px;
      line-height: 15px;
      font-weight: 300;
    }
    @media screen and (min-width: 599px) {
      .cover {
        height: 150px;
        min-width: 150px;
      }
      .title {
        font-size: 35px;
        line-height: 35px;
      }
      .artist-album {
        font-size: 20px;
        line-height: 20px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerHeaderComponent {

  @Input() currentTrack: Track;

  constructor(private sanitizer: DomSanitizer) {}

  getAvatarStyle(track: Track) {
    return track && track.coverUrl ? this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${track.coverUrl}")`) : '';
  }

}
