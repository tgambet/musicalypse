import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: `app-list-item`,
  template: `
    <a class="list-item hover" mat-list-item>

      <mat-checkbox matListIcon
                    color="primary"
                    [checked]="selected"
                    (change)="checked.emit($event.checked)"
                    (click)="$event.stopPropagation()">
      </mat-checkbox>

      <div matListAvatar class="avatar" [style]="avatarStyle">
        <mat-icon *ngIf="!avatarStyle">music_note</mat-icon>
      </div>

      <div matLine class="primary-text">
        <mat-icon class="warn" *ngIf="warn" color="warn" matTooltip="Unset tags!">warning</mat-icon>
        <span class="item-name" [innerHtml]="primaryHTML" [matTooltip]="tooltip"></span>
      </div>

      <div matLine class="secondary-text" [innerHtml]="secondaryHTML"></div>

      <button mat-button mat-icon-button (click)="arrowClicked.emit(); $event.stopPropagation()">
        <mat-icon>keyboard_arrow_right</mat-icon>
      </button>

      <mat-divider></mat-divider>

    </a>
  `,
  styles: [`
    .list-item {
      cursor: pointer;
      text-decoration: none;
    }
    .list-item:hover mat-checkbox {
      display: block;
    }
    .list-item:hover .avatar {
      display: none;
    }
    mat-checkbox {
      display: none;
      padding: 0 !important;
      line-height: 0;
      width: 20px !important;
      height: 20px !important;
      margin: 0 0.5rem !important;
    }
    .mat-checkbox-checked {
      display: block;
    }
    .mat-checkbox-checked ~ .avatar {
      display: none;
    }
    .avatar {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      background-size: cover;
      width: 40px;
      height: 40px;
    }
    .primary-text {
      font-size: 14px !important;
    }
    mat-icon.warn {
      height: 14px;
      width: 14px;
      font-size: 14px;
      line-height: 14px;
      vertical-align: middle;
      margin-right: 0.2rem;
    }
    .secondary-text {
      font-size: 12px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListItemComponent {

  @Input() selected: boolean;
  @Input() avatarStyle: string;
  @Input() warn: boolean;
  @Input() primaryHTML: string;
  @Input() secondaryHTML: string;
  @Input() tooltip: string;

  @Output() checked = new EventEmitter<boolean>();
  @Output() arrowClicked = new EventEmitter<void>();

}
