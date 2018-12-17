import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog} from '@angular/material';
import {combineLatest, Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {Playlist} from '@app/model';
import {InfoComponent} from '@app/shared/dialogs/info.component';
import {LibraryService} from '@app/library/services/library.service';
import {LibraryUtils} from '@app/library/library.utils';
import {ConfirmComponent} from '@app/shared/dialogs/confirm.component';

@Component({
  selector: 'app-playlists',
  template: `
    <div class="playlists">
      <h2>System Playlists</h2>
      <ul class="list center">
        <li class="item favorites" *ngIf="favoritePlaylist | async; let pl;">
          <div class="covers noCover" (click)="itemClicked(pl)">
            <mat-icon class="avatar-icon">favorite</mat-icon>
            <mat-icon class="play-icon">play_circle_outline</mat-icon>
          </div>
          <span class="primary">Favorites</span>
          <span class="secondary">{{ pl.tracks.length }} songs</span>
        </li>
        <li class="item favorites" *ngIf="recentPlaylist | async; let pl;">
          <div class="covers noCover" (click)="itemClicked(pl)">
            <mat-icon class="avatar-icon">schedule</mat-icon>
            <mat-icon class="play-icon">play_circle_outline</mat-icon>
          </div>
          <span class="primary">Recently Played</span>
          <span class="secondary">{{ pl.tracks.length }} songs</span>
        </li>
        <li class="item favorites" *ngIf="allPlaylist | async; let pl;">
          <div class="covers noCover" (click)="itemClicked(pl)">
            <mat-icon class="avatar-icon">music_note</mat-icon>
            <mat-icon class="play-icon">play_circle_outline</mat-icon>
          </div>
          <span class="primary">All songs</span>
          <span class="secondary">{{ pl.tracks.length }} songs</span>
        </li>
      </ul>
      <mat-divider></mat-divider>
      <h2>My Playlists</h2>
      <ul class="list center">
        <li class="item" *ngIf="(playlists | async).length === 0" (click)="openInfoDialog()">
          <div class="covers noCover">
            <mat-icon class="avatar-icon">bookmark_border</mat-icon>
            <mat-icon class="play-icon">bookmark</mat-icon>
          </div>
          <span class="primary" style="opacity: .5">My First Playlist</span>
          <!--<span class="secondary">0 songs</span>-->
        </li>
        <li class="item" *ngFor="let item of playlists | async">
          <div class="covers"
               [ngClass]="{
                  noCover: getCovers(item).length === 0,
                  c1: getCovers(item).length < 4,
                  c4: getCovers(item).length >= 4 && getCovers(item).length < 9,
                  c9: getCovers(item).length >= 9 && getCovers(item).length < 16,
                  c16: getCovers(item).length >= 16
               }"
               (click)="itemClicked(item)">
            <mat-icon class="avatar-icon">music_note</mat-icon>
            <ng-container *ngFor="let cover of getCovers(item).slice(0, 16)">
              <div [style]="getStyle(cover)" class="cover">&nbsp;</div>
            </ng-container>
            <mat-icon class="play-icon">play_circle_outline</mat-icon>
            <button mat-button mat-icon-button class="more" (click)="$event.stopPropagation()" [matMenuTriggerFor]="playlistMenu">
              <mat-icon>more_vert</mat-icon>
            </button>
          </div>
          <mat-menu #playlistMenu="matMenu">
            <button mat-menu-item (click)="itemClicked(item)">
              <mat-icon>playlist_play</mat-icon>
              <span>Load Playlist</span>
            </button>
            <button mat-menu-item (click)="deletePlaylist(item)">
              <mat-icon>delete</mat-icon>
              <span>Delete Playlist</span>
            </button>
          </mat-menu>
          <span class="primary" [matTooltip]="item.name">{{ item.name }}</span>
          <span class="secondary">{{ item.tracks.length }} songs</span>
        </li>
      </ul>
      <mat-divider></mat-divider>
      <h2>Main Artists</h2>
      <ul class="list center">
        <li class="item" *ngFor="let item of artistsPlaylists | async">
          <div class="covers"
               [ngClass]="{
                  noCover: getCovers(item).length === 0,
                  c1: getCovers(item).length < 4,
                  c4: getCovers(item).length >= 4 && getCovers(item).length < 9,
                  c9: getCovers(item).length >= 9 && getCovers(item).length < 16,
                  c16: getCovers(item).length >= 16
               }"
               (click)="itemClicked(item)">
            <mat-icon class="avatar-icon">music_note</mat-icon>
            <ng-container *ngFor="let cover of getCovers(item).slice(0, 16)">
              <div [style]="getStyle(cover)" class="cover">&nbsp;</div>
            </ng-container>
            <mat-icon class="play-icon">play_circle_outline</mat-icon>
          </div>
          <span class="primary" [matTooltip]="item.name">{{ item.name }}</span>
          <span class="secondary">{{ item.tracks.length }} songs</span>
        </li>
      </ul>
      <mat-divider></mat-divider>
      <h2>
        Suggested Albums
        <mat-icon class="info" matTooltip="A random list of albums based on your favorites and music you played recently.">info</mat-icon>
      </h2>
      <ul class="list center">
        <li class="item" *ngFor="let item of suggestedAlbumsPlaylists | async">
          <div class="covers"
               [ngClass]="{
                  noCover: getCovers(item).length === 0,
                  c1: getCovers(item).length < 4,
                  c4: getCovers(item).length >= 4 && getCovers(item).length < 9,
                  c9: getCovers(item).length >= 9 && getCovers(item).length < 16,
                  c16: getCovers(item).length >= 16
               }"
               (click)="itemClicked(item)">
            <mat-icon class="avatar-icon">music_note</mat-icon>
            <ng-container *ngFor="let cover of getCovers(item).slice(0, 16)">
              <div [style]="getStyle(cover)" class="cover">&nbsp;</div>
            </ng-container>
            <mat-icon class="play-icon">play_circle_outline</mat-icon>
          </div>
          <span class="primary" [matTooltip]="item.name">{{ item.name }}</span>
          <span class="secondary">{{ item.tracks.length }} songs</span>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    h2 {
      margin: 0.5rem 1rem 0;
    }
    .playlists {
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    .list {
      display: flex;
      flex-direction: row;
      list-style: none;
      margin: 0;
      padding: .5rem;
      overflow-x: scroll;
    }
    .list {
      padding-bottom: 6px;
    }
    .list::-webkit-scrollbar {
      display: none;
    }
    .list:hover {
      padding-bottom: 0;
    }
    .list:hover::-webkit-scrollbar {
      display: unset;
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
      overflow: hidden;
    }
    .covers .play-icon, .covers .avatar-icon {
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
      flex-basis: 25%;
      height: 25%;
    }
    .c9 .cover {
      flex-basis: 33.3333%;
      height: 33.3333%;
    }
    .c4 .cover {
      flex-basis: 50%;
      height: 50%;
    }
    .c1 .cover {
      flex-basis: 100%;
      height: 100%;
    }
    .play-icon {
      color: white;
      text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      display: none;
      position: absolute;
      left: 44px;
      top: 44px;
    }
    .more {
      position: absolute;
      right: 2px;
      bottom: 2px;
      display: none;
    }
    .covers:hover .play-icon, .covers:hover .more {
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
    mat-divider {
      margin: 0 1rem;
    }
    mat-icon.info {
      font-size: 20px;
      height: 20px;
      width: 20px;
      line-height: 20px;
      cursor: pointer;
      position: relative;
      top: 2px;
    }
    @media screen and (min-width: 599px){
      .item {
        margin: 1rem;
      }
      .list {
        flex-wrap: wrap;
        overflow-x: auto;
        padding-bottom: 0 !important;
      }
    }
  `]
})
export class PlaylistsComponent {

  playlists: Observable<Playlist[]>;
  favoritePlaylist: Observable<Playlist>;
  recentPlaylist: Observable<Playlist>;
  allPlaylist: Observable<Playlist>;

  artistsPlaylists: Observable<Playlist[]>;
  suggestedAlbumsPlaylists: Observable<Playlist[]>;

  constructor(
    private library: LibraryService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.playlists = library.getPlaylists();
    this.favoritePlaylist = this.library.getFavorites().pipe(
      map(favorites => ({ name: '_favorites', tracks: favorites}))
    );
    this.recentPlaylist = this.library.getRecentTracks().pipe(
      map(favorites => ({ name: '_recent', tracks: favorites}))
    );
    this.allPlaylist = this.library.getAllTracks().pipe(
      map(favorites => ({ name: '_all', tracks: favorites}))
    );
    this.artistsPlaylists = this.library.getAllArtists().pipe(
      map(artists => [...artists].sort((a, b) => b.songs - a.songs)), // /!\ sort is an "in-place" operation
      map(artists => artists.slice(0, 15)),
      switchMap(artists =>
        combineLatest(artists.map(artist =>
          this.library.getTracksByArtist(artist).pipe(
            map(tracks => ({name: artist.name, tracks: tracks}))
          )
        ))
      )
    );
    this.suggestedAlbumsPlaylists = combineLatest(this.library.getFavorites(), this.library.getRecentTracks()).pipe(
      map(array => [...array[0], ...array[1]]),
      map(tracks => tracks.map(track => ({
        id: track.albumArtist + '-' + track.album,
        name: `${track.album} • ${track.albumArtist}`
      }))),
      map(metas => LibraryUtils.uniqBy(metas, obj => obj.id)),
      map(metas => LibraryUtils.shuffleArray(metas).slice(0, 15)),
      switchMap(objs =>
        combineLatest(objs.map(meta => this.library.getTracksByAlbumId(meta.id).pipe(
          map(tracks => ({name: meta.name, tracks: tracks}))
        )))
      )
    );
  }

  openInfoDialog() {
    this.dialog.open(InfoComponent, {data: {title: 'Custom Playlists', message: `
      You don't have any custom playlist yet.<br>
      To create a new playlist select "Save playlist" from the player menu and it will appear on this page.
    `}});
  }

  getCovers(playlist: Playlist) {
    let covers = playlist.tracks
      .map(track => track.coverUrl)
      .filter(cover => !!cover);
    covers = LibraryUtils.uniq(covers);
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

  deletePlaylist(item: Playlist) {
    const message = `Are you sure that you want to delete the playlist "${item.name}"?`;
    this.dialog
      .open(ConfirmComponent, { data: { title: 'Confirm deletion', message: message }})
      .afterClosed()
      .subscribe(answer => {
        if (answer) {
          this.library.deletePlaylist(item.name);
        }
      });
  }

}
