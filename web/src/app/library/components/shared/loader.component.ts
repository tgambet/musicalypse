import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `
    <div *ngIf="show">
      <mat-spinner diameter="30"></mat-spinner>
      Loading...
    </div>
  `,
  styles: [`
    div {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow-y: scroll;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {

  @Input() show: boolean;

}
