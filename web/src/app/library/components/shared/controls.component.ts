import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-controls',
  template: `
    <div class="controls divider fake-scroll-y">
      <mat-form-field floatLabel="never" class="search" [class.show]="showSearch">
        <input #searchInput matInput title="Search" [(ngModel)]="search" (input)="searchChange.emit(search)" spellcheck="false">
        <mat-placeholder>
          <mat-icon class="search-icon">search</mat-icon>
          {{ searchPlaceholder }}
        </mat-placeholder>
        <button mat-button *ngIf="search" matSuffix mat-icon-button aria-label="Clear" (click)="search=''; searchChange.emit(search)">
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>
      <div class="controls-meta" [class.show]="!showSearch">
        <ng-content></ng-content>
      </div>
      <button mat-button mat-icon-button
              (click)="showSearch = !showSearch; showSearch ? searchInput.focus() : {}"
              class="searchButton">
        <mat-icon>search</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .controls {
      overflow-y: hidden;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      padding: 0 0.5rem 0 1rem;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .controls-meta {
      overflow: hidden;
      height: 60px;
      width: calc(100% - 40px - 2rem);
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: absolute;
      left: 1rem;
      transform: translateY(60px);
      transition-property: transform;
      transition-timing-function: ease;
      transition-duration: 0.4s;
    }
    .controls-meta.show {
      transform: translateY(0);
    }
    .search {
      flex-grow: 1;
      transform: translateY(-60px);
      transition-property: transform;
      transition-timing-function: ease;
      transition-duration: 0.4s;
    }
    .search.show {
      transform: translateY(0);
    }
    .search-icon {
      vertical-align: bottom;
    }
    .back {
      margin-right: 1rem;
      position: relative;
      z-index: 1;
    }
    .searchButton {
      margin-left: 1rem;
    }
  `]
})
export class ControlsComponent {

  @Input() search: string;
  @Input() searchPlaceholder: string;

  @Output() searchChange = new EventEmitter<string>();

  showSearch = false;

}
