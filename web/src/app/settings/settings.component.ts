import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import {SettingsService} from '../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  libraryFolders: string[] = [
    'D:/Musique/Metallica',
    'D:/Musique/Megadeth'
  ];

  files: File[] = [];

  constructor(public settings: SettingsService) { }

  ngOnInit() {
  }

  addFiles(files: FileList) {
    _.forEach(files, (file: File) => {
      const names = _.map(this.files, 'name');
      if (!_.includes(names, file.name)) {
        this.files.push(file);
      }
    });
  }

  cancel() {
    this.files = [];
  }

}
