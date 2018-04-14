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
        <span matLine>Recently played</span>
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
  styleUrls: ['sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavComponent {

  @Input() playing: boolean;

  @Output() closeSidenav = new EventEmitter<void>();

}
