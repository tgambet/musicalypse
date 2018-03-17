import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {environment} from '../../environments/environment';

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

  static getAudioUrl(sourceUrl: string) {
    if (environment.production) {
      return encodeURI(sourceUrl);
    } else {
      return `${window.location.protocol}//${window.location.hostname}:${environment.httpPort}${encodeURI(sourceUrl)}`;
    }
  }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
  }

  download() {
    // TODO move getAudioComponent elsewhere. refactor with PlayerComponent.getAudioUrl
    window.open(DetailsDialogComponent.getAudioUrl(this.data.track.url), '_blank');
  }

}
