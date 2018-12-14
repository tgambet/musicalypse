import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

// TODO add backdrop

@Component({
  selector: 'app-chips',
  template: `
    <mat-chip-list class="full-list mat-elevation-z3">
      <mat-chip class="remove-all" (click)="removeAll()">Remove All</mat-chip>
      <mat-chip *ngFor="let element of list" (click)="clickElement(element)">
        <span class="chip-text" [matTooltip]="element[displayProperty]">{{ element[displayProperty] }}</span>
        <mat-icon matChipRemove (click)="removeElement(element); $event.stopPropagation()">cancel</mat-icon>
      </mat-chip>
    </mat-chip-list>
  `,
  styles: [`
    .full-list {
      padding: 0.5rem;
      position: absolute;
      z-index: 2;
      top: 60px;
      width: 100%;
      box-sizing: border-box;
      max-height: 50%;
      overflow-y: auto;
    }
    mat-chip {
      cursor: pointer;
      max-width: calc(50% - 27px);
      white-space: nowrap;
    }
    .chip-text {
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsComponent {

  @Input() list: any[];
  @Input() displayProperty: string;

  @Output() clickedElement = new EventEmitter<any>();
  @Output() removedAll = new EventEmitter<void>();
  @Output() removedElement = new EventEmitter<any>();

  clickElement(element: any) {
    this.clickedElement.emit(element);
  }

  removeAll() {
    this.removedAll.emit();
  }

  removeElement(element: any) {
    this.removedElement.emit(element);
  }

}
