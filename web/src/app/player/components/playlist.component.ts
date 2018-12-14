import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {Track} from '@app/model';
import {SelectionModel} from '@angular/cdk/collections';
import {CoreUtils} from '@app/core/core.utils';
import {MatTable} from '@angular/material';

@Component({
  selector: 'app-player-playlist',
  template: `
    <em *ngIf="playlist.length === 0" class="empty">Playlist is empty</em>
    <mat-table [dataSource]="playlist" #table>

      <ng-container matColumnDef="select">
        <mat-cell *matCellDef="let row" class="select">
          <mat-checkbox (click)="$event.stopPropagation()"
                        (change)="$event ? selection.toggle(row) : null"
                        [checked]="selection.isSelected(row)"
                        color="primary">
          </mat-checkbox>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="title">
        <mat-cell *matCellDef="let track" class="title">
          <mat-icon class="equalizer" *ngIf="currentTrack ? currentTrack.url === track.url : false">equalizer</mat-icon>
          <div #title class="inner" [attr.data-url]="track.url">
            {{ track.title }}
          </div>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="artist">
        <mat-cell *matCellDef="let track" class="artist">
          <div class="inner">
            {{ track.artist }}
          </div>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="album">
        <mat-cell *matCellDef="let track" class="album">
          <div class="inner">
            {{ track.album }}
          </div>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="year">
        <mat-cell *matCellDef="let track" class="year">{{ track.year | sgYear }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="duration">
        <mat-cell *matCellDef="let track" class="duration">{{ track.duration | sgTime }}</mat-cell>
      </ng-container>

      <mat-row *matRowDef="let row; columns: columns;"
               [class.current]="currentTrack ? currentTrack.url === row.url : false"
               (click)="trackClicked.emit(row)">
      </mat-row>

    </mat-table>
  `,
  styles: [`
    .empty {
      margin: 0.5rem 1rem;
      display: inline-block;
    }
    mat-table {
      background: none !important;
    }
    mat-cell:first-of-type {
      padding-left: 1rem;
    }
    mat-cell:last-of-type {
      padding-right: 1rem;
    }
    .inner {
      padding-right: 0.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .title {
      flex-grow: 2;
    }
    .artist, .album {
      flex-grow: 1;
    }
    .select {
      max-width: 2.5rem;
    }
    .year, .duration {
      max-width: 3.5rem;
      justify-content: flex-end;
    }
    mat-row {
      cursor: pointer;
    }
    .equalizer {
      display: none;
      font-size: 20px;
    }
    .current .equalizer {
      display: inline-block;
    }
    .album, .year {
      display: none;
    }
    @media screen and (min-width: 599px) {
      .album, .year {
        display: flex;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerPlaylistComponent implements OnChanges {

  @Input() playlist: Track[];
  @Input() currentTrack: Track;

  @Output() trackClicked = new EventEmitter<Track>();

  columns = [/*'select',*/ 'title', 'artist', 'album', 'year', 'duration'];

  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<Track>(this.allowMultiSelect, this.initialSelection);

  @ViewChildren('title')
  titles: QueryList<ElementRef>;

  @ViewChild('table')
  table: MatTable<any>;

  // Scroll into view the current track if hidden
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.currentTrack || changes.playlist) && this.titles && this.table) {
      setTimeout(() => this.scrollCurrentTrackIntoView());
    }
  }

  scrollCurrentTrackIntoView() {
    const element = this.titles.find(el => el.nativeElement.getAttribute('data-url') === this.currentTrack.url);
    if (element && !CoreUtils.isScrolledIntoView(element.nativeElement, this.table['_elementRef'].nativeElement.parentElement)) {
      element.nativeElement.parentElement.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
    }
  }

}
