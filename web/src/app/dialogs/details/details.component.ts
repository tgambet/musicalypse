import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DetailsComponent>,
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
    window.open(DetailsComponent.getAudioUrl(this.data.track.url), '_blank');
  }

}

