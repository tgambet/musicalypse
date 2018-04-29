import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Track} from '@app/model';
import {Sort} from '@angular/material';
import {PageEvent} from '@angular/material/paginator/typings/paginator';
import {SelectionModel} from '@angular/cdk/collections';

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

    <mat-table [dataSource]="paginatedTracks" matSort (matSortChange)="sortState = $event">

      <ng-container matColumnDef="select">
        <mat-header-cell *matHeaderCellDef>
          <mat-checkbox (change)="$event ? masterToggle() : null"
                        [checked]="selection.hasValue() && isAllSelected()"
                        [indeterminate]="selection.hasValue() && !isAllSelected()"
                        color="primary">
          </mat-checkbox>
        </mat-header-cell>
        <mat-cell *matCellDef="let row">
          <mat-checkbox (click)="$event.stopPropagation()"
                        (change)="$event ? selection.toggle(row) : null"
                        [checked]="selection.isSelected(row)"
                        color="primary">
          </mat-checkbox>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="title">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Title</mat-header-cell>
        <mat-cell *matCellDef="let track">{{ track.metadata.title }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="artist">
        <mat-header-cell *matHeaderCellDef mat-sort-header>Artist</mat-header-cell>
        <mat-cell *matCellDef="let track">{{ track.metadata.albumArtist }}</mat-cell>
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
                   [length]="filteredTracks.length"
                   [pageIndex]="0"
                   [pageSize]="500"
                   [pageSizeOptions]="[500, 1000, 2000]"
                   [showFirstLastButtons]="true"
                   (page)="pageEvent = $event">
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
    mat-cell {
      /*white-space: nowrap;*/
      /*overflow: hidden;*/
      /*text-overflow: ellipsis;*/
    }
    .mat-column-year, .mat-column-duration {
      max-width: 5rem;
      justify-content: flex-end;
      overflow: visible;
    }
    .mat-column-artist, .mat-column-album, .mat-column-year, .mat-column-duration {
      font-size: 12px;
    }
    .mat-column-select {
      overflow: initial;
      max-width: 2.5rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TracksComponent implements OnChanges {

  @Input() tracks: Track[];

  columns = ['select', 'title', 'artist', 'album', 'year', 'duration'];

  paginatedTracks: Track[];
  filteredTracks: Track[];

  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<Track>(this.allowMultiSelect, this.initialSelection);

  private _search = '';
  set search(value: string) {
    this._search = value;
    this._update();
  }
  get search() {
    return this._search;
  }

  private _sortState: Sort = {
    active: 'url',
    direction: 'asc'
  };
  set sortState(value: Sort) {
    this._sortState = value;
    this._update();
  }

  private _pageEvent: PageEvent = {
    pageIndex: 0,
    previousPageIndex: 0,
    pageSize: 500,
    length: 0
  };
  set pageEvent(value: PageEvent) {
    this._pageEvent = value;
    this._update();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tracks) {
      this._update();
    }
  }

  filter(tracks: Track[]): Track[] {
    const toString = (track: Track) => `${track.metadata.album}${track.metadata.albumArtist}`
      + `${track.metadata.artist}${track.metadata.title}${track.metadata.year}`;
    return tracks.filter(track => toString(track).toLowerCase().includes(this.search.toLowerCase().trim()));
  }

  sort(tracks: Track[]): Track[] {
    function compare(a, b, isAsc) {
      return (a.localeCompare(b)) * (isAsc ? 1 : -1);
    }
    function compareNum(a, b, isAsc) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
    return tracks.sort((a, b) => {
      let isAsc = this._sortState.direction === 'asc';
      let active = this._sortState.active;
      if (!this._sortState.direction) {
        active = 'url';
        isAsc = true;
      }
      switch (active) {
        case 'url': return compare(a.url, b.url, isAsc);
        case 'title': return compare(a.metadata.title, b.metadata.title, isAsc);
        case 'artist': return compare(
          a.metadata.albumArtist + a.metadata.album,
          b.metadata.albumArtist + b.metadata.album,
          isAsc
        );
        case 'album': return compare(a.metadata.album, b.metadata.album, isAsc);
        case 'year': return compare(
          a.metadata.year ? a.metadata.year : '3000',
          b.metadata.year ? b.metadata.year : '3000',
          isAsc
        );
        case 'duration': return compareNum(a.metadata.duration, b.metadata.duration.toString(), isAsc);
        default: return 0;
      }
    });
  }

  paginate(tracks: Track[]): Track[] {
    const index = this._pageEvent.pageIndex;
    const size = this._pageEvent.pageSize;
    return tracks.slice(index * size, (index + 1) * size);
  }

  _update() {
    this.filteredTracks = this.sort(this.filter(this.tracks));
    this.paginatedTracks = this.paginate(this.filteredTracks);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.filteredTracks.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.filteredTracks.forEach(row => this.selection.select(row));
  }

}
