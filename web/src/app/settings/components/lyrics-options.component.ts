import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {LyricsOptions} from '@app/model';

@Component({
  selector: 'app-lyrics-options',
  template: `
    <p>
      <mat-slide-toggle color="primary" [(ngModel)]="lyricsOpts.useService" (change)="toggleUseService()">
        Find lyrics on the Web
      </mat-slide-toggle>
    </p>
    <p class="sub">
      <mat-slide-toggle color="primary" [(ngModel)]="lyricsOpts.services.wikia"
                    [disabled]="!lyricsOpts.useService" (change)="toggleService()">
        Search on lyrics.wikia.com
        <a href="http://lyrics.wikia.com" target="_blank"
           aria-label="http://lyrics.wikia.com" class="open" (click)="linkClicked.emit($event)">
          <mat-icon class="small">open_in_new</mat-icon>
        </a>
      </mat-slide-toggle>
    </p>
    <p class="sub">
      <mat-slide-toggle color="primary" [(ngModel)]="lyricsOpts.services.lyricsOvh"
                    [disabled]="!lyricsOpts.useService" (change)="toggleService()">
        Use the lyrics.ovh service
        <a href="http://lyrics.ovh" target="_blank"
           aria-label="https://lyrics.ovh" class="open" (click)="linkClicked.emit($event)">
          <mat-icon class="small">open_in_new</mat-icon>
        </a>
      </mat-slide-toggle>
    </p>
    <p class="sub">
      <mat-slide-toggle color="primary" [(ngModel)]="lyricsOpts.automaticSave" [disabled]="!lyricsOpts.useService" (change)="save()">
        Save found lyrics automatically
        <mat-icon class="small" [matTooltip]="lyricsSaveTooltip">info</mat-icon>
      </mat-slide-toggle>
    </p>
  `,
  styles: [`
    mat-icon.small {
      margin-left: 0.25rem;
      font-size: 18px;
      height: 18px;
      width: 18px;
      position: relative;
      top: 4px
    }
    .sub {
      padding-left: 1.2rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LyricsOptionsComponent {

  @Input() lyricsOpts: LyricsOptions;
  @Output() linkClicked: EventEmitter<Event> = new EventEmitter();
  @Output() optionsChanged: EventEmitter<LyricsOptions> = new EventEmitter();

  lyricsSaveTooltip = 'If you enable this option, every time lyrics are found they are saved on disk for future use.' +
    ' Otherwise they are saved on disk only if you edit them.';

  toggleService() {
    if (!this.lyricsOpts.services.wikia && !this.lyricsOpts.services.lyricsOvh) {
      this.lyricsOpts.useService = false;
    }
    this.save();
  }

  toggleUseService() {
    if (this.lyricsOpts.useService && !(this.lyricsOpts.services.wikia || this.lyricsOpts.services.lyricsOvh)) {
      this.lyricsOpts.services.wikia = true;
      this.lyricsOpts.services.lyricsOvh = true;
    }
    this.save();
  }

  save() {
    this.optionsChanged.emit(this.lyricsOpts);
  }

}
