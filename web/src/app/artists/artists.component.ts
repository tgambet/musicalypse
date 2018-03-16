import {Component, OnInit} from '@angular/core';
import {Artist} from '../model';
import * as _ from 'lodash';
import {LibraryService} from '../services/library.service';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-artists',
  templateUrl: './artists.component.html',
  styleUrls: ['./artists.component.scss', '../common.scss']
})
export class ArtistsComponent implements OnInit {

  artists: Artist[] = _.clone(this.library.artists);

  selectedArtists: Artist[] = [];

  onSelectionChange: Observable<Artist[]>;

  private onSelectionChangeSource: Subject<Artist[]> = new Subject();

  constructor(private library: LibraryService) {
    this.onSelectionChange = this.onSelectionChangeSource.asObservable();
  }

  ngOnInit() {
    // subscribe to new tracks and library reset
    this.library.onTrackAdded.subscribe(() => this.artists = _.clone(this.library.artists));
  }

  isSelectedArtist(artist: Artist): boolean {
    return _.includes(this.selectedArtists, artist);
  }

  selectArtist(artist: Artist) {
    this.selectedArtists = [artist];
    this.onSelectionChangeSource.next([artist]);
  }

  addArtist(artist: Artist) {
    if (!_.includes(this.selectedArtists, artist)) {
      this.selectedArtists.push(artist);
      this.onSelectionChangeSource.next(this.selectedArtists);
    }
  }

  removeArtist(artist: Artist) {
    if (_.includes(this.selectedArtists, artist)) {
      _.remove(this.selectedArtists, a => a.name === artist.name);
      this.onSelectionChangeSource.next(this.selectedArtists);
    }
  }

}
