import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-library-folders',
  template: `
    <mat-list>
      <mat-list-item class="hover" *ngFor="let folder of folders">
        <mat-icon mat-list-icon>folder_open</mat-icon>
        <span matLine>{{ folder }}</span>
        <button class="close" mat-button mat-icon-button (click)="removeFolder.emit(folder)">
          <mat-icon>close</mat-icon>
        </button>
      </mat-list-item>
      <mat-list-item *ngIf="loading">
        <mat-spinner mat-list-icon [diameter]="24"></mat-spinner>
        <span matLine>Loading...</span>
      </mat-list-item>
    </mat-list>
    <button mat-button tabindex="0" (click)="addFolder.emit()">
      <mat-icon mat-list-icon>create_new_folder</mat-icon>
      <span matLine>Add a new folder</span>
    </button>
    <button mat-button [disabled]="folders.length == 0" tabindex="0" (click)="scanRequest.emit()">
      <mat-icon mat-list-icon>sync</mat-icon>
      <span matLine>Scan library</span>
    </button>
    <p class="error" *ngIf="error">Error: {{ error }}</p>
    <mat-menu></mat-menu>
  `,
  styles: [`
    mat-list {
      padding-top: 0 !important;
      margin-bottom: 12px;
      max-width: 500px;
    }
    button:not(.close) mat-icon {
      margin-right: 0.5rem;
    }
    mat-spinner {
      width: 16px !important;
      height: 16px !important;;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibraryFoldersComponent {

  @Input() folders: string[];
  @Input() error: string;
  @Input() loading: boolean;

  @Output() addFolder = new EventEmitter<void>();
  @Output() removeFolder = new EventEmitter<string>();
  @Output() scanRequest = new EventEmitter<void>();

}
