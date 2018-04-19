import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

// TODO review CSS: group controls.meta and form field and display as column
@Component({
  selector: 'app-controls',
  template: `
    <div class="controls divider fake-scroll-y">
      <button mat-button mat-icon-button class="back" (click)="backClicked.emit()" *ngIf="backButton">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <div class="controls-meta" [class.show]="!showSearch">
        <ng-content></ng-content>
      </div>
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
    .back ~ .controls-meta {
      left: calc(40px + 2rem);
      width: calc(100% - 80px - 3rem);
    }

    @media screen and (min-width: 959px){
      .back ~ .controls-meta {
        left: 1rem;
        width: calc(100% - 40px - 2rem);
      }
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
