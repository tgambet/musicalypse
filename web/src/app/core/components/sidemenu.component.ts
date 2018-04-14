import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-side-menu',
  template: `
    <nav class="side-menu">
      <button mat-icon-button (click)="toggleSidenav.emit()" class="toggle">
        <mat-icon>{{ sideNavOpened ? 'close' : 'menu' }}</mat-icon>
      </button>
      <button mat-icon-button
              routerLink="/library"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="closeSidenav.emit()">
        <mat-icon>queue_music</mat-icon>
      </button>
      <button mat-icon-button>
        <mat-icon>schedule</mat-icon>
      </button>
      <button mat-icon-button>
        <mat-icon>favorite_border</mat-icon>
      </button>
      <button mat-icon-button class="album">
        <mat-icon>album</mat-icon>
      </button>
      <button mat-icon-button>
        <mat-icon>mode_edit</mat-icon>
      </button>
      <button mat-icon-button routerLink="/settings" routerLinkActive="active" (click)="closeSidenav.emit()">
        <mat-icon>settings</mat-icon>
      </button>
      <button mat-icon-button>
        <mat-icon>info</mat-icon>
      </button>
    </nav>
  `,
  styleUrls: ['sidemenu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenuComponent {

  @Input() sideNavOpened: boolean;

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() closeSidenav = new EventEmitter<void>();

}
