import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Album, Artist} from '@app/model';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-my-music-artists',
  template: `
    <div class="controls">
      <a class="play-all">
        <mat-icon>shuffle</mat-icon>
        Play all randomly ({{ artists.length }})
      </a>
      <div class="filler"></div>
      <mat-form-field floatLabel="never" class="search">
        <input #searchInput matInput title="Search" [(ngModel)]="search" spellcheck="false">
        <mat-placeholder>
          <mat-icon class="search-icon">search</mat-icon>
          Search
        </mat-placeholder>
        <button mat-button *ngIf="search" matSuffix mat-icon-button aria-label="Clear" (click)="search=''">
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>
    </div>

    <app-box-list [center]="true"
                  [list]="displayedArtists"
                  [primaryFunc]="primaryFunc"
                  [secondaryFunc]="secondaryFunc"
                  (itemClicked)="play($event)">
    </app-box-list>
  `,
  styles: [`
    .controls {
      padding: 0 1rem;
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: wrap;
    }
    .play-all {
      margin: 1rem 0
    }
    .play-all mat-icon {
      vertical-align: middle;
      margin-right: 0.2rem;
    }
    .filler {
      flex-grow: 1;
    }
    .search {
      min-width: 13rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistsComponent implements OnChanges {

  @Input() artists: Artist[];

  displayedArtists: Artist[];

  _search = '';
  set search(value: string) {
    this._search = value;
    this.displayedArtists = this.filter(this.artists);
  }
  get search() {
    return this._search;
  }

  primaryFunc = (artist: Artist) => artist.name;
  secondaryFunc = (artist: Artist) => artist.songs + ' song' + (artist.songs > 1 ? 's' : '');

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.artists) {
      const artists = changes.artists.currentValue;
      this.displayedArtists = this.filter(artists);
    }
  }

  getAvatarStyle(artist: Artist) {
    return artist.avatarUrl ? this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${artist.avatarUrl}")`) : '';
  }

  play(album: Artist | Album) {
    console.log(album);
  }

  filter(artists: Artist[]): Artist[] {
    const toStringAlbum = (artist: Artist) => `${artist.name}`;
    return artists.filter(artist => toStringAlbum(artist).toLowerCase().includes(this._search.toLowerCase().trim()));
  }

}
