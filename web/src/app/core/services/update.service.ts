import {Injectable} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';
import {MatDialog} from '@angular/material';
import {ConfirmComponent} from '@app/shared/dialogs/confirm.component';

@Injectable()
export class UpdateService {

  constructor(private updates: SwUpdate, private dialog: MatDialog) {}

  initialize(): void {
    this.updates.available.subscribe(event => {
      // console.log('current version is', event.current);
      // console.log('available version is', event.available);
      const dialogRef = this.dialog.open(ConfirmComponent, {
        data: {
          title: 'New version available!',
          message: `Do you want to activate the new version of Musicalypse (${event.current.appData['version']})?`
        }
      });
      dialogRef.afterClosed().subscribe(confirmed => {
        if (confirmed) {
          this.updates.activateUpdate().then(() => document.location.reload());
        }
      });
    });
    /*this.updates.activated.subscribe(event => {
      // console.log('old version was', event.previous);
      // console.log('new version is', event.current);
    });*/
  }
}
