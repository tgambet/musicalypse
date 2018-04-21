import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-controls',
  template: `
    <div class="controls divider fake-scroll-y">
      <button mat-button mat-icon-button class="back" (click)="backClicked.emit()" *ngIf="backButton" >
        <mat-icon>arrow_back</mat-icon>
      </button>
      <div class="controls-inner">
        <mat-form-field floatLabel="never" class="search" [class.showSearch]="showSearch">
          <input #searchInput matInput title="Search" [(ngModel)]="search" (input)="searchChange.emit(search)" spellcheck="false">
          <mat-placeholder>
            <mat-icon class="search-icon">search</mat-icon>
            {{ searchPlaceholder }}
          </mat-placeholder>
          <button mat-button *ngIf="search" matSuffix mat-icon-button aria-label="Clear" (click)="search=''; searchChange.emit(search)">
            <mat-icon>close</mat-icon>
          </button>
        </mat-form-field>
        <div class="controls-meta" [class.showSearch]="showSearch">
          <ng-content></ng-content>
        </div>
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
      box-sizing: border-box;
    }
    .controls-inner {
      flex-grow: 1;
      align-self: flex-end;
      display: flex;
      flex-direction: column;
      transition-property: transform;
      transition-timing-function: ease;
      transition-duration: 0.4s;
      overflow: hidden;
    }
    .controls-meta {
      height: 60px;
      display: flex;
      flex-direction: row;
      align-items: center;
      transition-property: transform;
      transition-timing-function: ease;
      transition-duration: 0.4s;
    }
    .controls-meta.showSearch {
      transform: translateY(60px);
    }
    .search {
      height: 60px;
      transition-property: transform;
      transition-timing-function: ease;
      transition-duration: 0.4s;
    }
    .search.showSearch {
      transform: translateY(60px);
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlsComponent {

  @Input() backButton: boolean;
  @Input() search: string;
  @Input() searchPlaceholder: string;

  @Output() searchChange = new EventEmitter<string>();
  @Output() backClicked = new EventEmitter<void>();

  showSearch = false;

}
