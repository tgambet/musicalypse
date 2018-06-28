import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-initializer',
  template: `
    <div class="app-loader" *ngIf="initializing">
      <mat-spinner [diameter]="50" *ngIf="!hasErrors"></mat-spinner>
      <mat-icon class="error-icon" color="warn" *ngIf="hasErrors">error_outline</mat-icon>
      <span>{{ initializingLog }}</span>
      <span *ngIf="hasErrors" class="retry" (click)="retry.emit()">Retry</span>
      <span *ngIf="!hasErrors" class="filler">&nbsp;</span>
    </div>
  `,
  styles: [`
    :host-context(.electron) .app-loader {
      top: 34px;
    }
    .app-loader {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }
    .app-loader mat-spinner {
      margin-bottom: 0.5rem;
    }
    .app-loader .error-icon {
      height: 50px;
      width: 50px;
      line-height: 50px;
      font-size: 50px;
      margin-bottom: 0.5rem;
    }
    .app-loader .retry {
      text-decoration: underline;
      cursor: pointer;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InitializerComponent {

  @Input() initializing = true;
  @Input() hasErrors: boolean;
  @Input() initializingLog: string;

  @Output() retry = new EventEmitter<void>();

}
