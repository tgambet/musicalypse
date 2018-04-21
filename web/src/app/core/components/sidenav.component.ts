import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-side-nav',
  template: `
    <mat-nav-list>
      <h3 mat-subheader>Navigation</h3>
      <mat-divider></mat-divider>
      <a mat-list-item routerLink="/library"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{ exact: true }"
         (click)="closeSidenav.emit()">
        <mat-icon matListIcon>queue_music</mat-icon>
        <span matLine>
          <mat-icon *ngIf="playing" class="playing-icon">volume_up</mat-icon>
          Library
        </span>
      </a>
      <a mat-list-item routerLink="/recent" routerLinkActive="active" (click)="closeSidenav.emit()">
        <mat-icon matListIcon>schedule</mat-icon>
        <span matLine>Played recently</span>
      </a>
      <a mat-list-item routerLink="/favorites" routerLinkActive="active" (click)="closeSidenav.emit()">
        <mat-icon matListIcon>favorite_border</mat-icon>
        <span matLine>Favorites</span>
      </a>
      <a mat-list-item routerLink="/playlists" routerLinkActive="active" (click)="closeSidenav.emit()">
        <mat-icon matListIcon>album</mat-icon>
        <span matLine>Playlists</span>
      </a>
      <mat-divider></mat-divider>
      <a mat-list-item routerLink="/editor" routerLinkActive="active" (click)="closeSidenav.emit()">
        <mat-icon matListIcon>mode_edit</mat-icon>
        <span matLine>Tag editor</span>
      </a>
      <a mat-list-item routerLink="/settings" routerLinkActive="active" (click)="closeSidenav.emit()">
        <mat-icon matListIcon>settings</mat-icon>
        <span matLine>Settings</span>
      </a>
      <a mat-list-item routerLink="/about" routerLinkActive="active" (click)="closeSidenav.emit()">
        <mat-icon matListIcon>info</mat-icon>
        <span matLine>About</span>
      </a>
    </mat-nav-list>
  `,
  styles: [`
    a {
      text-decoration: none;
    }
    mat-icon {
      padding: 0 !important;
    }
    .playing-icon {
      height: 18px;
      width: 18px;
      line-height: 18px;
      font-size: 18px;
      vertical-align: text-top;
    }
    @media screen and (min-width: 599px){
      mat-icon:not(.playing-icon) {
        display: none;
      }
      .mat-line {
        margin-left: -1rem !important;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavComponent {

  @Input() playing: boolean;

  @Output() closeSidenav = new EventEmitter<void>();

}
