import {ChangeDetectionStrategy, Component} from '@angular/core';
import {LibraryService} from '@app/library/services/library.service';
import {Observable} from 'rxjs';
import {Album, Artist, Track} from '@app/model';

@Component({
  selector: 'app-my-music',
  template: `
    <div class="my-music">
      <mat-tab-group>
        <mat-tab [label]="'Artists'">
          <app-my-music-artists [artists]="artists$ | async">
          </app-my-music-artists>
        </mat-tab>
        <mat-tab [label]="'Albums'">
          <app-my-music-albums [albums]="albums$ | async">
          </app-my-music-albums>
        </mat-tab>
        <mat-tab [label]="'Tracks'">
          <app-my-music-tracks [tracks]="tracks$ | async">
          </app-my-music-tracks>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .my-music {
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyMusicComponent {

  tracks$: Observable<Track[]>;
  artists$: Observable<Artist[]>;
  albums$: Observable<Album[]>;

  constructor(private library: LibraryService) {
    this.tracks$ = library.getAllTracks();
    this.artists$ = library.getAllArtists();
    this.albums$ = library.getAllAlbums();
  }

}
