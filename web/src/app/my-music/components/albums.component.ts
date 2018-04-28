import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Album, Artist} from '@app/model';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-my-music-albums',
  template: `
    <div class="controls">
      <a class="play-all">
        <mat-icon>shuffle</mat-icon>
        Play all randomly ({{ albums.length }})
      </a>
      <div class="filler"></div>
      <mat-form-field floatLabel="never" class="search">
        <input matInput title="Search" [(ngModel)]="search" spellcheck="false">
        <mat-placeholder>
          <mat-icon class="search-icon">search</mat-icon>
          Search
        </mat-placeholder>
        <button mat-button *ngIf="search" matSuffix mat-icon-button aria-label="Clear" (click)="search=''">
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>
    </div>

    <app-box-list [center]="false"
                  [list]="displayedAlbums"
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
      margin: 1rem 0;
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
export class AlbumsComponent implements OnChanges {

  @Input() albums: Album[];

  displayedAlbums: Album[];

  _search = '';
  set search(value: string) {
    this._search = value;
    this.displayedAlbums = this.filter(this.albums);
  }
  get search() {
    return this._search;
  }

  primaryFunc = (album: Album) => album.title;
  secondaryFunc = (album: Album) => album.artist;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.albums) {
      const albums = changes.albums.currentValue;
      this.displayedAlbums = this.filter(albums);
    }
  }

  getAvatarStyle(album: Album) {
    return album.avatarUrl ? this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${album.avatarUrl}")`) : '';
  }

  play(album: Artist | Album) {
    console.log(album);
  }

  filter(albums: Album[]): Album[] {
    const toStringAlbum = (album: Album) => `${album.artist} ${album.title}`;
    return albums.filter(album => toStringAlbum(album).toLowerCase().includes(this._search.toLowerCase().trim()));
  }

}
