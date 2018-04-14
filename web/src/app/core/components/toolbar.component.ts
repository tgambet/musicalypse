import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Theme} from '@app/model';

@Component({
  selector: 'app-toolbar',
  template: `
    <mat-toolbar>
      <button mat-icon-button (click)="toggleSideNav.emit()" class="toggle">
        <mat-icon>{{ sideNavOpened ? 'close' : 'menu' }}</mat-icon>
      </button>
      <h1>
        <a routerLink="/" class="link" tabindex="-1">
          Musicalypse
        </a>
      </h1>
      <div class="filler"></div>
      <!--<div class="electron-buttons" *ngIf="isElectron">-->
        <!--<mat-icon class="electron-theme" (click)="themeChooser = true">format_color_fill</mat-icon>-->
        <!--<mat-icon (click)="application.minimize()">remove</mat-icon>-->
        <!--<mat-icon (click)="application.maximize()" *ngIf="!application.isMaximized()">crop_square</mat-icon>-->
        <!--<mat-icon (click)="application.unmaximize()" *ngIf="application.isMaximized()">crop_16_9</mat-icon>-->
        <!--<mat-icon class="close" (click)="application.close()">close</mat-icon>-->
      <!--</div>-->
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

  @Output() toggleSideNav = new EventEmitter<void>();
  @Output() changeTheme = new EventEmitter<Theme>();

  getThemeStyle(theme: Theme) {
    return this.sanitizer.bypassSecurityTrustStyle(`background-color: ${theme.color}`);
  }

}
