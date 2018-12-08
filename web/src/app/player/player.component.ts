import {Component} from '@angular/core';
import {LibraryService} from '@app/library/services/library.service';
import {Observable} from 'rxjs';
import {Playlist, Track} from '@app/model';
import {DomSanitizer} from '@angular/platform-browser';
import {AudioService} from '@app/core/services/audio.service';
import {take, tap, mergeMap} from 'rxjs/operators';
import {PlaylistsDialogComponent} from '@app/shared/dialogs/playlists-dialog.component';
import {MatDialog} from '@angular/material';
import {Router} from '@angular/router';

@Component({
  selector: 'app-player',
  template: `
    <div class="player-background">
      <div class="b1" [style]="getAvatarStyle(currentTrack$ | async)"></div>
      <div class="b2"></div>
    </div>
    <div class="player">
      <app-player-header [currentTrack]="currentTrack$ | async"></app-player-header>
      <app-player-progress [loading]="loading$ | async"
                           [duration]="duration$ | async"
                           [currentTime]="currentTime$ | async"
                           (seekTo)="seekTo($event)">
      </app-player-progress>
      <app-player-controls [volume]="volume$ | async"
                           [muted]="muted$ | async"
                           [currentTrack]="currentTrack$ | async"
                           [playing]="playing$ | async"
                           [isFavorite]="isFavorite$ | async"
                           [playlist]="playlist$ | async"
                           [playlists]="playlists$ | async"
                           [repeat]="repeat$ | async"
                           [shuffle]="shuffle$ | async"
                           (pause)="pause()"
                           (resume)="resume()"
                           (setRepeat)="setRepeat($event)"
                           (setShuffle)="setShuffle($event)"
                           (playNext)="playNext()"
                           (playPrevious)="playPrevious()"
                           (toggleFavorite)="toggleFavorite($event)"
                           (setMute)="setMute($event)"
                           (setVolume)="setVolume($event)"
                           (showInLibrary)="showInLibrary()"
                           (clearPlaylist)="clearPlaylist()"
                           (savePlaylist)="savePlaylist()"
                           (loadPlaylist)="loadPlaylist($event)"
                           (addAllToPlaylist)="addAllToPlaylist($event)">
      </app-player-controls>
      <app-player-playlist [playlist]="playlist$ | async"
                           [currentTrack]="currentTrack$ | async"
                           (trackClicked)="play($event)">
      </app-player-playlist>
      <!--<app-player-status [playlist]="playlist$ | async"
                         [currentTrack]="currentTrack$ | async">
      </app-player-status>-->
    </div>
  `,
  styles: [`
    .player-background {
      position: fixed;
      z-index: 1;
      top: 1px;
      left: 1px;
      right: 1px;
      bottom: 1px;
    }
    .b1, .b2 {
      position: absolute;
      width: 100%;
      height: 100%;
    }
    .b1 {
      background-size: cover;
      background-position: center;
      filter: blur(10px);
    }
    .player {
      position: relative;
      z-index: 2;
      height: 100%;
      background-size: cover;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    app-player-playlist {
      flex-grow: 1;
      overflow-y: auto;
    }
  `]
})
export class PlayerComponent {

  currentTrack$: Observable<Track>;
  playlist$: Observable<Track[]>;
  playlists$: Observable<Playlist[]>;
  repeat$: Observable<boolean>;
  shuffle$: Observable<boolean>;
  isFavorite$: Observable<boolean>;

  volume$: Observable<number>;
  muted$: Observable<boolean>;
  playing$: Observable<boolean>;
  loading$: Observable<boolean>;
  currentTime$: Observable<number>;
  duration$: Observable<number>;

  constructor(
    private library: LibraryService,
    private audio: AudioService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.currentTrack$ = library.getCurrentTrack();
    this.playlist$ = library.getPlaylist();
    this.playlists$ = library.getPlaylists();
    this.repeat$ = library.getRepeat();
    this.shuffle$ = library.getShuffle();
    this.volume$ = audio.volume$;
    this.muted$ = audio.muted$;
    this.playing$ = audio.playing$;
    this.loading$ = audio.loading$;
    this.currentTime$ = audio.currentTime$;
    this.duration$ = audio.duration$;
    this.isFavorite$ = this.currentTrack$.pipe(mergeMap(t => this.library.isFavorite(t)));
  }

  getAvatarStyle(track: Track) {
    return track && track.coverUrl ? this.sanitizer.bypassSecurityTrustStyle(`background-image: url("${track.coverUrl}")`) : '';
  }

  seekTo(time: number) {
    this.audio.seekTo(time);
  }

  pause() {
    this.audio.pause();
  }

  resume() {
    this.audio.resume();
  }

  setRepeat(value: boolean) {
    this.library.setRepeat(value);
  }

  setShuffle(value: boolean) {
    this.library.setShuffle(value);
  }

  playNext() {
    this.library.playNextTrack();
  }

  playPrevious() {
    this.library.playPreviousTrack();
  }

  toggleFavorite(track: Track) {
    this.library.isFavorite(track).pipe(
      take(1),
      tap(isFav => isFav ? this.library.removeFromFavorites(track) : this.library.addToFavorites(track))
    ).subscribe();
  }

  setMute(muted: boolean) {
    muted ? this.audio.mute() : this.audio.unmute();
  }

  setVolume(volume: number) {
    this.audio.setVolume(volume);
  }

  play(track: Track) {
    this.library.playTrack(track);
  }

  showInLibrary() {
    this.router.navigate(['library']).then(() => {
      this.playlist$.pipe(take(1)).subscribe(
        next => this.library.selectInLibrary(next)
      );
    });
  }

  clearPlaylist() {
    this.library.clearPlaylist();
  }

  savePlaylist() {
    const dialogRef = this.dialog.open(PlaylistsDialogComponent, {});
    dialogRef.afterClosed().subscribe(playlistName => {
      if (playlistName) {
        this.playlist$.pipe(take(1)).subscribe(
          next => this.library.savePlaylist(playlistName, next)
        );
      }
    });
  }

  loadPlaylist(playlist: Playlist) {
    this.library.loadPlaylist(playlist);
  }

  addAllToPlaylist(playlist: Playlist) {
    this.playlist$.pipe(take(1)).subscribe(
      next => this.library.addToPlaylist(next, playlist.name)
    );
  }

}
