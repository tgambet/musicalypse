import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

// TODO refactor with app-progress
@Component({
  selector: 'app-player-progress',
  template: `
    <div class="progress">
      <span class="time-elapsed">{{ currentTime ? (currentTime | sgTime) : '00:00' }}</span>
      <mat-progress-bar
        *ngIf="loading"
        mode="indeterminate"></mat-progress-bar>
      <mat-slider
        *ngIf="!loading"
        color="primary"
        [step]="1"
        [disabled]="!duration"
        [max]="duration"
        [value]="currentTime"
        (change)="seekTo.emit($event.value)"></mat-slider>
      <span class="time-total">{{ duration ? (duration | sgTime) : '00:00' }}</span>
    </div>
  `,
  styles: [`
    .progress {
      padding: 0 1rem;
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 36px;
      min-height: 36px;
    }
    mat-slider {
      flex-grow: 1;
      margin: 0 8px;
    }
    mat-progress-bar {
      margin: 0 22px;
      height: 2px;
      flex-grow: 1;
    }
    .time-elapsed, .time-total {
      width: 2.5rem;
    }
    .time-total {
      text-align: right;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerProgressComponent {

  @Input() loading: boolean;
  @Input() currentTime: number;
  @Input() duration: number;

  @Output() seekTo = new EventEmitter<number>();

}
