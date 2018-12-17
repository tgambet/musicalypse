import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Theme} from '@app/core/core.utils';

@Component({
  selector: 'app-toolbar',
  template: `
    <mat-toolbar>
      <button mat-icon-button (click)="toggleSidenav.emit()" class="toggle">
        <mat-icon>{{ sideNavOpened ? 'close' : 'menu' }}</mat-icon>
      </button>
      <h1>
        <!--<img src="assets/logo_green_optimized.svg" alt="Logo" height="30">-->
        Musicalypse
      </h1>
      <div class="filler"></div>
      <button mat-button
              class="install-button"
              *ngIf="showInstallPrompt"
              (click)="install.emit()">
        <mat-icon>get_app</mat-icon>
        Install
      </button>
      <div class="micro-player" *ngIf="!isElectron">
        <button mat-icon-button *ngIf="isPlaying" (click)="pause.emit()">
          <mat-icon>pause</mat-icon>
        </button>
        <button mat-icon-button *ngIf="!isPlaying" (click)="play.emit()">
          <mat-icon>play_arrow</mat-icon>
        </button>
      </div>
      <div class="electron-buttons" *ngIf="isElectron">
        <mat-icon (click)="pause.emit()" *ngIf="isPlaying">pause</mat-icon>
        <mat-icon (click)="play.emit()" *ngIf="!isPlaying">play_arrow</mat-icon>
        <mat-icon class="electron-theme" (click)="themeChooser = true">format_color_fill</mat-icon>
        <mat-icon (click)="minimizeWindow.emit()">remove</mat-icon>
        <mat-icon (click)="maximizeWindow.emit()" *ngIf="!isMaximized">crop_square</mat-icon>
        <mat-icon (click)="unmaximizeWindow.emit()" *ngIf="isMaximized">crop_16_9</mat-icon>
        <mat-icon class="close" (click)="closeWindow.emit()">close</mat-icon>
      </div>
      <button mat-button mat-icon-button
              class="theme-button"
              (click)="themeChooser = true"
              *ngIf="!isElectron">
        <mat-icon>format_color_fill</mat-icon>
      </button>
      <div class="theme-chooser-backdrop" *ngIf="themeChooser" (click)="themeChooser = false"></div>
      <div class="theme-chooser" [class.visible]="themeChooser" (click)="themeChooser = false">
        <ol>
          <li *ngFor="let theme of themes">
            <button mat-icon-button (click)="changeTheme.emit(theme)" [style]="getThemeStyle(theme)">
              <mat-icon *ngIf="theme.cssClass === currentTheme.cssClass" color="primary">check</mat-icon>
            </button>
          </li>
        </ol>
      </div>
    </mat-toolbar>
  `,
  styleUrls: ['toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent {

  constructor (private sanitizer: DomSanitizer) {}

  themeChooser = false;

  @Input() sideNavOpened: boolean;
  @Input() themes: Theme[];
  @Input() currentTheme: Theme;
  @Input() isElectron: boolean;
  @Input() isMaximized: boolean;
  @Input() showInstallPrompt: boolean;
  @Input() isPlaying: boolean;

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() changeTheme = new EventEmitter<Theme>();
  @Output() closeWindow = new EventEmitter<void>();
  @Output() maximizeWindow = new EventEmitter<void>();
  @Output() minimizeWindow = new EventEmitter<void>();
  @Output() unmaximizeWindow = new EventEmitter<void>();
  @Output() install = new EventEmitter<void>();
  @Output() play = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();

  getThemeStyle(theme: Theme) {
    return this.sanitizer.bypassSecurityTrustStyle(`background-color: ${theme.color}`);
  }

}
