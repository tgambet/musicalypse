import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Album, Artist} from '@app/model';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-box-list',
  template: `
    <ul class="list" [class.center]="center">
      <li class="item" *ngFor="let item of list">
        <div class="cover"
             [ngClass]="{ noArt: !item.avatarUrl }"
             [style]="getAvatarStyle(item)"
             (click)="itemClicked.emit(item)">
          <mat-icon *ngIf="!item.avatarUrl" class="avatar-icon">music_note</mat-icon>
          <mat-icon class="play-icon">play_circle_outline</mat-icon>
        </div>
        <span class="primary">{{ primaryFunc(item) }}</span>
        <span class="secondary">{{ secondaryFunc(item) }}</span>
      </li>
    </ul>
  `,
  styles: [`
    .list {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      list-style: none;
      margin: 0;
      padding: 0 0.5rem 0.5rem 0.5rem;
      justify-content: space-evenly;
    }
    .item {
      width: 150px;
      margin: 0.5rem;
      display: flex;
      flex-direction: column;
    }
    .item:hover .cover {
      box-shadow: 0 5px 10px 2px rgba(0, 0, 0, 0.2);
    }
    .cover {
      box-sizing: border-box;
      width: 150px;
      height: 150px;
      background-size: cover;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .cover mat-icon {
      width: 60px;
      height: 60px;
      line-height: 60px;
      font-size: 60px;
      user-select: none;
    }
    .play-icon {
      color: white;
      text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      display: none;
    }
    .cover:hover .play-icon {
      display: unset;
    }
    .cover:hover .avatar-icon {
      display: none;
    }
    .primary {
      font-weight: 500;
      white-space: nowrap;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .secondary {
      font-weight: 300;
      font-size: 12px;
    }
    .center .primary, .center .secondary {
      text-align: center;
    }
    @media screen and (min-width: 599px){
      .item {
        margin: 1rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoxListComponent {

  @Input() center: boolean;
  @Input() list: (Artist[] | Album[]);
  @Input() primaryFunc: (item: Artist | Album) => string;
  @Input() secondaryFunc: (item: Artist | Album) => string;

  @Output() itemClicked = new EventEmitter<Artist | Album>();

  constructor(private sanitizer: DomSanitizer) {}

  getAvatarStyle(item: Artist | Album) {
    return item.avatarUrl ? this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${item.avatarUrl}")`) : '';
  }

}
