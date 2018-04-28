import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Artist} from '@app/model';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-my-music-artists',
  template: `
    <div class="controls">
      <a class="play-all">
        <mat-icon>shuffle</mat-icon>
        Play all randomly ({{ artists.length }})
      </a>
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
                  [list]="artists"
                  [primaryFunc]="primaryFunc"
                  [secondaryFunc]="secondaryFunc">
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
      margin-top: 1rem;
      margin-right: 1rem;
      margin-bottom: 1rem;
    }
    .play-all mat-icon {
      vertical-align: middle;
      margin-right: 0.2rem;
    }
    .search {
      min-width: 13rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistsComponent {

  @Input() artists: Artist[];

  search: '';

  primaryFunc = (artist: Artist) => artist.name;
  secondaryFunc = (artist: Artist) => artist.songs + ' song' + (artist.songs > 1 ? 's' : '');

  constructor(private sanitizer: DomSanitizer) {}

  getAvatarStyle(artist: Artist) {
    return artist.avatarUrl ? this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${artist.avatarUrl}")`) : '';
  }

}
