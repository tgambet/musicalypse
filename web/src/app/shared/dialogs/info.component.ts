import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-info',
  template: `
    <h3 mat-dialog-title>{{ data.title }}</h3>
    <div mat-dialog-content class="mat-typography">
      <p [innerHtml]="data.message"></p>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="true">Ok</button>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {}

}
