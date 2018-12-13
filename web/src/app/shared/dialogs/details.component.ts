import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
// import {CoreUtils} from '@app/core/core.utils';

@Component({
  selector: 'app-details',
  template: `
    <h3 mat-dialog-title>Details of "{{ data.track.title }}"</h3>
    <div mat-dialog-content>
      <mat-grid-list cols="2" rowHeight="fit" gutterSize="1rem">
        <mat-grid-tile [colspan]="2">
          <mat-form-field>
            <input matInput placeholder="Title" [(ngModel)]="data.track.title" spellcheck="false" disabled>
          </mat-form-field>
        </mat-grid-tile>
        <mat-grid-tile>
          <mat-form-field>
            <input matInput placeholder="Artist(s)" [(ngModel)]="data.track.artist" spellcheck="false" disabled>
          </mat-form-field>
        </mat-grid-tile>
        <mat-grid-tile>
          <mat-form-field>
            <input matInput placeholder="Album" [(ngModel)]="data.track.album" spellcheck="false" disabled>
          </mat-form-field>
        </mat-grid-tile>
        <mat-grid-tile>
          <mat-form-field>
            <input matInput placeholder="Album Artist" [(ngModel)]="data.track.albumArtist" spellcheck="false" disabled>
          </mat-form-field>
        </mat-grid-tile>
        <mat-grid-tile>
          <mat-form-field>
            <input matInput placeholder="Year" [(ngModel)]="data.track.year" disabled>
          </mat-form-field>
        </mat-grid-tile>
        <mat-grid-tile [colspan]="2">
          <mat-form-field>
            <input class="location" matInput placeholder="Location" disabled [value]="data.track.location">
            <!--<button mat-button matSuffix mat-icon-button (click)="download()">
              <mat-icon>file_download</mat-icon>
            </button>-->
          </mat-form-field>
        </mat-grid-tile>
      </mat-grid-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="cancel()">Ok</button>
      <!--<button mat-button (click)="cancel()">Cancel</button>
      <button mat-button [mat-dialog-close]="data.track">Save</button>-->
    </div>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
      display: block;
    }
    mat-grid-list {
      height: 300px;
      width: 452px;
    }
    /*.location, .url {
      font-size: 80%;
    }*/
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
  }

/*  download() {
    window.open(CoreUtils.resolveUrl(this.data.track.url), '_blank');
  }*/

}

