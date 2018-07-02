import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-library-folders',
  template: `
    <mat-list>
      <mat-list-item class="hover" *ngFor="let folder of folders">
        <mat-icon mat-list-icon>folder_open</mat-icon>
        <span matLine>{{ folder }}</span>
        <button mat-button mat-icon-button (click)="removeFolder.emit(folder)">
          <mat-icon>close</mat-icon>
        </button>
      </mat-list-item>
      <button mat-menu-item tabindex="0" (click)="addFolder.emit()">
        <mat-icon mat-list-icon>create_new_folder</mat-icon>
        <span matLine>Add a new folder</span>
      </button>
      <button mat-menu-item [disabled]="folders.length == 0" tabindex="0" (click)="scanRequest.emit()">
        <mat-icon mat-list-icon>sync</mat-icon>
        <span matLine>Scan library</span>
      </button>
    </mat-list>
    <p class="error" *ngIf="error">Error: {{ error }}</p>
    <mat-menu></mat-menu>
  `,
  styles: [`
    mat-list {
      padding-top: 0 !important;
      margin-bottom: 12px;
    }
    .mat-menu-item {
      padding-left: 20px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibraryFoldersComponent {

  @Input() folders: string[];
  @Input() error: string;

  @Output() addFolder = new EventEmitter<void>();
  @Output() removeFolder = new EventEmitter<string>();
  @Output() scanRequest = new EventEmitter<void>();

}
