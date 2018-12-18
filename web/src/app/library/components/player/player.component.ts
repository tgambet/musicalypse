import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {MatDialog, MatList, MatTabGroup} from '@angular/material';
import {BreakpointObserver} from '@angular/cdk/layout';
import {Observable, Subscription} from 'rxjs';
import {take, tap} from 'rxjs/operators';

import {LyricsResult, Playlist, Track} from '@app/model';
import {CoreUtils} from '@app/core/core.utils';
import {DetailsComponent} from '@app/shared/dialogs/details.component';
import {PlaylistsDialogComponent} from '@app/shared/dialogs/playlists-dialog.component';

import {LibraryService} from '@app/library/services/library.service';
import {LyricsService} from '@app/library/services/lyrics.service';

@Component({
  selector: 'app-library-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent implements OnInit, OnDestroy, OnChanges {

  @Input() currentTrack: Track;
  @Input() playing: boolean;
  @Input() volume: number;
  @Input() muted: boolean;
  @Input() shuffle: boolean;
  @Input() repeat: boolean;
  @Input() playlist: Track[];
  @Input() playlists: Playlist[];
  @Input() lyricsResult: LyricsResult;
  @Input() viewLoading: boolean;

  loading$: Observable<boolean>;
  duration$: Observable<number>;
  currentTime$: Observable<number>;

  @Output() previous: EventEmitter<void> = new EventEmitter();

  @ViewChild('carousel')
  carousel: MatTabGroup;

  @ViewChild('playlistMatList')
  playlistMatList: MatList;

  @ViewChild('playlistUl')
  playlistUl: ElementRef;

  @ViewChild('lyrics')
  lyricsRef: ElementRef;

  selectedCarouselIndex = 0;

  smallScreen: boolean;

  subscriptions: Subscription[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    // public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private library: LibraryService,
    private lyricsService: LyricsService
  ) {
    this.loading$ = this.library.getAudioLoading();
    this.duration$ = this.library.getAudioDuration();
    this.currentTime$ = this.library.getAudioCurrentTime();
  }

  @ViewChildren('listItem')
  listItems: QueryList<ElementRef>;

  // Scroll into view the current track if hidden
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.currentTrack || changes.playlist) && this.listItems && (this.playlistMatList || this.playlistUl)) {
      setTimeout(() => this.scrollCurrentTrackIntoView());
    }
    // TODO: remove if a lyrics loader is implemented
    if (changes.currentTrack && this.lyricsRef && this.lyricsRef.nativeElement.parentElement) {
      this.lyricsRef.nativeElement.parentElement.scrollTop = 0;
      /*this.lyricsRef.nativeElement.parentElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });*/
    }
  }

  scrollCurrentTrackIntoView() {
    // TODO: refactor
    const listElement =
      this.playlistUl ? this.playlistUl.nativeElement.parentElement : this.playlistMatList['_elementRef'].nativeElement.parentElement;
    // If the list element (scrolling parent) is not visible skip scrolling
    if (!listElement || !CoreUtils.isHorizontallyVisible(listElement)) {
      return;
    }
    const trackRef =
      this.listItems.find(el => el.nativeElement.getAttribute('data-url') === this.currentTrack.url);
    if (trackRef) {
      const element = trackRef.nativeElement;
      if (!CoreUtils.isScrolledIntoView(element, listElement)) {
        element.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
      }
    }
  }

  ngOnInit() {
    this.subscriptions.push(
      this.breakpointObserver.observe('(max-width: 599px)').subscribe(result => {
        this.smallScreen = result.matches;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  trackByURL(index: number, track: Track) {
    return track.url;
  }

  swipeLeft() {
    if (this.selectedCarouselIndex < 2) {
      this.selectedCarouselIndex += 1;
    }
  }

  swipeRight() {
    if (this.selectedCarouselIndex > 0) {
      this.selectedCarouselIndex -= 1;
    } else {
      this.previous.emit();
    }
  }

  resume() {
    this.library.play();
  }

  pause() {
    this.library.pause();
  }

  seekTo(time: number) {
    this.library.seekTo(time);
  }

  setVolume(value: number) {
    this.library.setVolume(value);
  }

  setMuted(muted: boolean) {
    this.library.setMuted(muted);
  }

  clearPlaylist() {
    this.library.clearPlaylist();
  }

  playPrevious(): void {
    this.library.playPreviousTrack();
  }

  playNext() {
    this.library.playNextTrack();
  }

  setShuffle(value: boolean) {
    this.library.setShuffle(value);
  }

  setRepeat(value: boolean) {
    this.library.setRepeat(value);
  }

  playTrack(track: Track) {
    this.library.playTrack(track);
  }

  showInLibrary() {
    this.library.selectInLibrary(this.playlist);
  }

  isFavorite(track: Track): Observable<boolean> {
    return this.library.isFavorite(track);
  }

  addOrRemoveFromFavorites(track: Track) {
    this.library.isFavorite(track).pipe(
      take(1),
      tap(isFav => isFav ? this.library.removeFromFavorites(track) : this.library.addToFavorites(track))
    ).subscribe();
  }

  savePlaylist() {
    const dialogRef = this.dialog.open(PlaylistsDialogComponent, {});
    dialogRef.afterClosed().subscribe(playlistName => {
      if (playlistName) {
        this.library.savePlaylist(playlistName, this.playlist);
      }
    });
  }

  loadPlaylist(playlist: Playlist) {
    this.library.loadPlaylist(playlist);
  }

  addAllToPlaylist(playlist: Playlist) {
    this.library.addToPlaylist(this.playlist, playlist.name);
  }

  isTrackCurrent(track: Track) {
    return this.currentTrack && this.currentTrack.url === track.url;
  }

  openDetailsDialog(track: Track) {
    const dialogRef = this.dialog.open(DetailsComponent, {
      data: { track: track }
    });
    dialogRef.afterClosed().subscribe(() => {

    });
  }

  getTotalDuration(): number {
    return this.playlist.reduce((total, track) => total + track.duration, 0);
  }

  lyricsEdited(event) {
    const lyrics = event.target.textContent
      .replace(/\n{3,}/g, '\n')
      .split('\n')
      .map(line => line.trim())
      .join('\n');

    if (lyrics === '') { return; }
    if (this.lyricsResult && this.lyricsResult.lyrics && this.lyricsResult.lyrics.trim() === lyrics) { return; }

    this.lyricsResult.lyrics = lyrics;
    this.lyricsService.saveLyrics(lyrics, this.currentTrack.artist, this.currentTrack.title);
  }

  lyricsPasted(event) {
    event.preventDefault();
    const text = (event.originalEvent || event).clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);
  }

  onKeyDown(event) {
    if (event.code === 'Enter') {
      document.execCommand('insertHTML', false, '\n');
      return false;
    }
  }

  errorClicked() {
    delete this.lyricsResult.error;
    this.lyricsResult.lyrics = '';
    setTimeout(() => this.lyricsRef.nativeElement.focus());
  }

}
