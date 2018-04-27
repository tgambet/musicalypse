import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-side-menu',
  template: `
    <nav class="side-menu">
      <button mat-icon-button (click)="toggleSidenav.emit()" class="last-of-category">
        <mat-icon>{{ sideNavOpened ? 'close' : 'menu' }}</mat-icon>
      </button>
      <button mat-icon-button
              routerLink="/playing"
              routerLinkActive="active"
              (click)="closeSidenav.emit()">
        <mat-icon>play_circle_outline</mat-icon>
      </button>
      <button mat-icon-button
              routerLink="/mymusic"
              routerLinkActive="active"
              (click)="closeSidenav.emit()">
        <mat-icon>view_module</mat-icon>
      </button>
      <button mat-icon-button
              class="last-of-category"
              routerLink="/playlists"
              routerLinkActive="active"
              (click)="closeSidenav.emit()">
        <mat-icon>album</mat-icon>
      </button>
      <button mat-icon-button
              routerLink="/library"
              routerLinkActive="active"
              (click)="closeSidenav.emit()">
        <mat-icon>queue_music</mat-icon>
      </button>
      <button mat-icon-button
              routerLink="/recent"
              routerLinkActive="active"
              (click)="closeSidenav.emit()">
        <mat-icon>schedule</mat-icon>
      </button>
      <button mat-icon-button
              class="last-of-category"
              routerLink="/favorites"
              routerLinkActive="active"
              (click)="closeSidenav.emit()">
        <mat-icon>favorite_border</mat-icon>
      </button>
      <button mat-icon-button
              routerLink="/editor"
              routerLinkActive="active"
              (click)="closeSidenav.emit()">
        <mat-icon>mode_edit</mat-icon>
      </button>
      <button mat-icon-button
              routerLink="/settings"
              routerLinkActive="active"
              (click)="closeSidenav.emit()">
        <mat-icon>settings</mat-icon>
      </button>
      <button mat-icon-button
              routerLink="/about"
              routerLinkActive="active"
              (click)="closeSidenav.emit()">
        <mat-icon>info</mat-icon>
      </button>
    </nav>
  `,
  styles: [`
    .side-menu {
      position: absolute;
      top: 50px;
      left: 0;
      bottom: 0;
      display: none;
      flex-direction: column;
      align-items: center;
      width: 44px;
      z-index: 2;
      min-height: 380px;
    }
    button {
      margin: 4px 0;
      box-sizing: content-box;
    }
    .last-of-category {
      margin-bottom: 5px;
    }
    :host-context(.electron) .side-menu {
      top: 34px;
    }
    @media screen and (min-width: 599px){
      .side-menu {
        display: flex;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenuComponent {

  @Input() sideNavOpened: boolean;

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() closeSidenav = new EventEmitter<void>();

}
