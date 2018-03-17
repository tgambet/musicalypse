import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {PlayerComponent} from '../player/player.component';

@Component({
  selector: 'app-details-dialog',
  templateUrl: './details-dialog.component.html',
  styleUrls: ['./details-dialog.component.scss']
})
export class DetailsDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
  }

  download() {
    // TODO move PlayerComponent.getAudioComponent elsewhere
    window.open(PlayerComponent.getAudioUrl(this.data.track.url), '_blank');
  }

}
