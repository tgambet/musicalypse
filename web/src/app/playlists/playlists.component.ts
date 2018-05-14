import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {Playlist} from '@app/model';
import {LibraryService} from '@app/library/services/library.service';
import {DomSanitizer} from '@angular/platform-browser';

import * as _ from 'lodash';
import {Router} from '@angular/router';

@Component({
  selector: 'app-playlists',
  template: `
    <div class="playlists">
      <header>
        <h2>Playlists</h2>
        <span class="filler"></span>
        <button mat-button
                color="primary">
          <mat-icon>add</mat-icon>
          New playlist
        </button>
      </header>
      <ul class="list center">
        <li class="item" *ngFor="let item of playlists | async">
          <div class="covers"
               [ngClass]="{
                  noCover: getCovers(item).length === 0,
                  c1: getCovers(item).length === 1,
                  c4: getCovers(item).length > 1 && getCovers(item).length <= 4,
                  c9: getCovers(item).length >= 5 && getCovers(item).length <= 9,
                  c16: getCovers(item).length >= 10
               }"
               (click)="itemClicked(item)">
            <mat-icon class="avatar-icon">music_note</mat-icon>
            <ng-container *ngFor="let cover of getCovers(item).slice(0, 16)">
              <div [style]="getStyle(cover)" class="cover">&nbsp;</div>
            </ng-container>
            <mat-icon class="play-icon">play_circle_outline</mat-icon>
          </div>
          <span class="primary">{{ item.name }}</span>
          <span class="secondary">{{ item.tracks.length }} songs</span>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    header {
      display: flex;
      padding: 0.5rem;
    }
    h2 {
      margin: 0;
    }
    .filler {
      flex-grow: 1;
    }
    header button {
      align-self: flex-end;
    }
    .list {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      list-style: none;
      margin: 0;
      padding: 0 0.5rem 0.5rem 0.5rem;
      justify-content: space-evenly;
    }
    .item {
      width: 150px;
      margin: 0.5rem;
      display: flex;
      flex-direction: column;
    }
    .item:hover .covers {
      box-shadow: 0 5px 10px 2px rgba(0, 0, 0, 0.2);
    }
    .covers {
      position: relative;
      box-sizing: border-box;
      width: 150px;
      height: 150px;
      background-size: cover;
      margin-bottom: 0.5rem;
      display: flex;
      cursor: pointer;
      flex-wrap: wrap;
      align-content: center;
      align-items: center;
    }
    .covers mat-icon {
      width: 60px;
      height: 60px;
      line-height: 60px;
      font-size: 60px;
      user-select: none;
    }
    .cover {
      background-size: cover;
    }
    .c16 .cover {
      min-width: 25%;
      max-width: 25%;
      min-height: 25%;
      max-height: 25%;
    }
    .c9 .cover {
      min-width: 33.3333%;
      max-width: 33.3333%;
      min-height: 33.3333%;
      max-height: 33.3333%;
    }
    .c4 .cover {
      min-width: 50%;
      max-width: 50%;
      min-height: 50%;
      max-height: 50%;
    }
    .c1 .cover {
      min-width: 100%;
      min-height: 100%;
    }
    .play-icon {
      color: white;
      text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      display: none;
      position: absolute;
      left: 45px;
      top: 45px;
    }
    .covers:hover .play-icon {
      display: unset;
    }
    .covers .avatar-icon {
      display: none;
    }
    .covers.noCover {
      justify-items: center;
      align-items: center;
      align-content: center;
      justify-content: center;
    }
    .noCover .avatar-icon {
      display: unset;
    }
    .covers:hover .avatar-icon {
      display: none;
    }
    .primary {
      font-weight: 500;
      white-space: nowrap;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .secondary {
      font-weight: 300;
      font-size: 12px;
    }
    .center .primary, .center .secondary {
      text-align: center;
    }
    @media screen and (min-width: 599px){
      .item {
        margin: 1rem;
      }
    }
  `]
})
export class PlaylistsComponent {

  playlists: Observable<Playlist[]>;

  constructor(
    private library: LibraryService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    this.playlists = library.getPlaylists();
  }

  getCovers(playlist: Playlist) {
    let covers = playlist.tracks
      .map(track => track.coverUrl)
      .filter(cover => !!cover);
    covers = _.uniq(covers);
    return covers;
  }

  getStyle(cover: string) {
    return this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${cover}")`);
  }

  itemClicked(item: Playlist) {
    this.library.loadPlaylist(item);
    if (item.tracks.length > 0) {
      this.library.playTrack(item.tracks[0]);
    }
    this.router.navigate(['/playing']);
  }

}
