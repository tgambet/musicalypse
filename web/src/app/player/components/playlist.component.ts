import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Track} from '@app/model';
import {SelectionModel} from '@angular/cdk/collections';

@Component({
  selector: 'app-player-playlist',
  template: `
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
          <div class="inner">
            {{ track.metadata.title }}
          </div>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="artist">
        <mat-cell *matCellDef="let track" class="artist">
          <div class="inner">
            {{ track.metadata.artist }}
          </div>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="album">
        <mat-cell *matCellDef="let track" class="album">
          <div class="inner">
            {{ track.metadata.album }}
          </div>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="year">
        <mat-cell *matCellDef="let track" class="year">{{ track.metadata.year | sgYear }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="duration">
        <mat-cell *matCellDef="let track" class="duration">{{ track.metadata.duration | sgTime }}</mat-cell>
      </ng-container>

      <mat-row *matRowDef="let row; columns: columns;"
               [class.current]="currentTrack ? currentTrack.url === row.url : false"
               (click)="trackClicked.emit(row)">
      </mat-row>

    </mat-table>
  `,
  styles: [`
    mat-table {
      background: none !important;
    }
    .inner {
      padding-right: 0.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerPlaylistComponent {

  @Input() playlist: Track[];
  @Input() currentTrack: Track;

  @Output() trackClicked = new EventEmitter<Track>();

  columns = [/*'select',*/ 'title', 'artist', 'album', 'year', 'duration'];

  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<Track>(this.allowMultiSelect, this.initialSelection);

}
