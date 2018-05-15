import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-new-playlist-dialog',
  template: `
    <h3 mat-dialog-title>New Playlist</h3>
    <div mat-dialog-content>
      <mat-form-field>
        <input matInput placeholder="Playlist name" [(ngModel)]="playlistName" spellcheck="false">
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-button [mat-dialog-close]="playlistName" [disabled]="!playlistName">Save</button>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewPlaylistDialogComponent {

  playlistName: '';

  constructor(
    public dialogRef: MatDialogRef<NewPlaylistDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  cancel() {
    this.dialogRef.close();
  }
}
