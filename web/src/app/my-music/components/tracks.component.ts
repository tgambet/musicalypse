import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Track} from '@app/model';
import {MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-my-music-tracks',
  template: `
    <div class="controls">
      <a class="play-all">
        <mat-icon>shuffle</mat-icon>
        Play all randomly ({{ tracks.length }})
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

    <mat-table [dataSource]="tracks.slice(0, 500)" matSort (matSortChange)="sort($event)">

      <ng-container matColumnDef="title">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Title</mat-header-cell>
        <mat-cell *matCellDef="let track">{{ track.metadata.title }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="artist">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Artist</mat-header-cell>
        <mat-cell *matCellDef="let track">{{ track.metadata.artist }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="album">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Album</mat-header-cell>
        <mat-cell *matCellDef="let track">{{ track.metadata.album }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="year">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Year</mat-header-cell>
        <mat-cell *matCellDef="let track">{{ track.metadata.year }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="duration">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Duration</mat-header-cell>
        <mat-cell *matCellDef="let track">{{ track.metadata.duration | sgTime }}</mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="columns"></mat-header-row>

      <mat-row *matRowDef="let row; columns: columns;"></mat-row>

    </mat-table>
    <mat-paginator #paginator
                   [length]="tracks.length"
                   [pageIndex]="0"
                   [pageSize]="500"
                   [pageSizeOptions]="[500, 1000, 2000]"
                   [showFirstLastButtons]="true"
                   (page)="paginate($event)">
    </mat-paginator>
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
    mat-table {
      background: unset !important;
    }
    mat-row, mat-header-row {
      min-height: 40px;
    }
    .mat-column-year, .mat-column-duration {
      max-width: 5rem;
      justify-content: flex-end;
      overflow: visible;
    }
    .mat-column-artist, .mat-column-album, .mat-column-year, .mat-column-duration {
      font-size: 12px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TracksComponent implements OnInit {

  @Input() tracks: Track[];

  columns = ['title', 'artist', 'album', 'year', 'duration'];

  tracksSource: MatTableDataSource<Track>;

  _search = '';
  set search(value: string) {
    this._search = value;
  }
  get search() {
    return this._search;
  }

  ngOnInit(): void {
    this.tracksSource = new MatTableDataSource(this.tracks);
  }

  filter(filter: string) {
    console.log(filter);
  }

  sort(event) {
    console.log(event);
  }

  paginate(event) {
    console.log(event);
  }

}
