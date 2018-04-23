import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Theme} from '@app/core/core.utils';

@Component({
  selector: 'app-themes',
  template: `
    <mat-radio-group>
      <mat-radio-button *ngFor="let theme of themes"
                        [value]="theme.cssClass"
                        [checked]="currentTheme.cssClass === theme.cssClass"
                        (change)="changeTheme.emit(theme)"
                        color="primary">
        {{ theme.name }}
      </mat-radio-button>
    </mat-radio-group>
  `,
  styles: [`
    mat-radio-button {
      display: block;
      margin-bottom: 1rem;
      padding-left: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemesComponent {

  @Input() themes: Theme[];
  @Input() currentTheme: Theme;

  @Output() changeTheme = new EventEmitter<Theme>();

}
