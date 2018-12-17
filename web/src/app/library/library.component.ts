import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions} from '@angular/material';
import {combineLatest, EMPTY, Observable, of, Subscription} from 'rxjs';
import {filter, switchMap, take, tap} from 'rxjs/operators';

import {Album, Artist, LyricsResult, Playlist, Track} from '@app/model';
import {LibraryService} from './services/library.service';
import {RouterService} from '@app/core/services/router.service';
import {RouterStateUrl} from '@app/app.serializer';
import {environment} from '@env/environment';
import {LyricsService} from '@app/library/services/lyrics.service';
import {SettingsService} from '@app/settings/services/settings.service';

export const tooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 500,
  hideDelay: 250,
  touchendHideDelay: 100,
};

@Component({
  selector: 'app-library',
  template: `
    <div class="container">
      <div class="content"
           [ngClass]="'t' + contentTranslation"
           [class.no-track]="!(currentTrack$ | async)"
           [class.no-animation]="noAnimation">
        <div class="column a1">
          <app-loader [show]="viewLoading"></app-loader>
          <app-artists #artistsComponent
                       *ngIf="!viewLoading"
                       [artists]="artists$ | async"
                       [selectedArtists]="selectedArtists$ | async"
                       [displayType]="displayType"
                       (next)="translateContent(1)">
          </app-artists>
        </div>
        <div class="column a2">
          <app-loader [show]="viewLoading"></app-loader>
          <app-albums #albumsComponent
                      *ngIf="!viewLoading"
                      [albums]="albums$ | async"
                      [selectedAlbums]="selectedAlbums$ | async"
                      [displayType]="displayType"
                      (next)="translateContent(2)"
                      (previous)="translateContent(0)">
          </app-albums>
        </div>
        <div class="column a3">
          <app-loader [show]="viewLoading"></app-loader>
          <app-tracks #tracksComponent
                      *ngIf="!viewLoading"
                      (next)="translateContent(3)"
                      (previous)="translateContent(1)"
                      [tracks]="tracks$ | async"
                      [currentTrack]="currentTrack$ | async">
          </app-tracks>
        </div>
        <div class="column a4">
          <app-library-player [currentTrack]="currentTrack$ | async"
                              [playlist]="playlist$ | async"
                              [playlists]="playlists$ | async"
                              [muted]="muted$ | async"
                              [volume]="volume$ | async"
                              [playing]="playing$ | async"
                              [shuffle]="shuffle$ | async"
                              [repeat]="repeat$ | async"
                              [lyricsResult]="lyricsResult$ | async"
                              [viewLoading]="viewLoading"
                              (previous)="translateContent(2)">
          </app-library-player>
        </div>
        <app-mini-player [currentTrack]="currentTrack$ | async"
                         [playlist]="playlist$ | async"
                         [muted]="muted$ | async"
                         [volume]="volume$ | async"
                         [duration]="duration$ | async"
                         [currentTime]="currentTime$ | async"
                         [playing]="playing$ | async"
                         [loading]="loading$ | async"
                         (next)="translateContent(3)">
        </app-mini-player>
      </div>
    </div>
  `,
  styleUrls: ['./library.component.scss'],
  providers: [
    {provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: tooltipDefaults}
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibraryComponent implements OnInit, OnDestroy {

  viewLoading = true;

  artists$: Observable<Artist[]>         = of([]);
  selectedArtists$: Observable<Artist[]> = of([]);
  albums$: Observable<Album[]>           = of([]);
  selectedAlbums$: Observable<Album[]>   = of([]);
  tracks$: Observable<Track[]>           = of([]);
  currentTrack$: Observable<Track>       = EMPTY;
  playlist$: Observable<Track[]>         = of([]);
  playlists$: Observable<Playlist[]>     = of([]);
  shuffle$: Observable<boolean>          = of(false);
  repeat$: Observable<boolean>           = of(false);
  playing$: Observable<boolean>          = of(false);
  loading$: Observable<boolean>          = of(false);
  volume$: Observable<number>            = of(1);
  muted$: Observable<boolean>            = of(false);
  duration$: Observable<number>          = of(0);
  currentTime$: Observable<number>       = of(0);
  lyricsResult$: Observable<LyricsResult>     = EMPTY;

  subscriptions: Subscription[] = [];

  // urlData: Object = {};

  contentTranslation = 0;
  displayType: DisplayType;

  noAnimation = true;
  private animationTimeout;

  constructor(
    private router: Router,
    private library: LibraryService,
    private route: ActivatedRoute,
    private routerService: RouterService,
    private ref: ChangeDetectorRef,
    private lyricsService: LyricsService,
    private settings: SettingsService
  ) {

  }

  @HostListener('window:resize') onResize() {
    this.noAnimation = true;
    clearTimeout(this.animationTimeout);
    this.animationTimeout = setTimeout(() => this.noAnimation = false, 200);
  }

  // updateUrlDataFromArtists(artists: Artist[]) {
  //   if (artists.length === 0) {
  //     delete this.urlData['artists'];
  //   } else {
  //     const artistsData = _.map(artists, artist => artist.name.replace(',', '%c%').replace('&', '%a%'));
  //     this.urlData['artists'] = _.sortBy(artistsData);
  //   }
  // }
  //
  // updateUrlDataFromAlbums(albums: Album[]) {
  //   if (albums.length === 0) {
  //     delete this.urlData['albums'];
  //   } else {
  //     const albumData = _.map(albums, album => album.title.replace(',', '%c%').replace('&', '%a%'));
  //     this.urlData['albums'] = _.sortBy(albumData);
  //   }
  // }

  // updateState(routeParam: ParamMap) {
  //   if (routeParam.has('t')) {
  //     this.contentTranslation = +routeParam.get('t');
  //   } else {
  //     this.contentTranslation = 0;
  //   }
  //   if (routeParam.has('artists')) {
  //     const artists = routeParam
  //       .get('artists')
  //       .split(',')
  //       .map(v => v.replace('%c%', ',').replace('%a%', '&'));
  //     this.library.selectArtistsByName(artists);
  //   } else {
  //     this.library.deselectAllArtists();
  //   }
  //   if (routeParam.has('albums')) {
  //     const artists = routeParam
  //       .get('albums')
  //       .split(',')
  //       .map(v => v.replace('%c%', ',').replace('%a%', '&'));
  //     this.library.selectAlbumsByName(artists);
  //   } else {
  //     this.library.deselectAllAlbums();
  //   }
  // }

  ngOnInit() {
    setTimeout(() => {
      this.initializeObservables();
      this.viewLoading = false;
      this.ref.detectChanges();
    });
    const translateOnUrlChange = this.route.queryParamMap.subscribe(params => {
      const t = params.get('t');
      if (t !== null && t !== this.contentTranslation.toString(10)) {
        this.contentTranslation = parseInt(t, 10);
        this.ref.detectChanges();
      }
    });
    this.subscriptions.push(translateOnUrlChange);
    this.noAnimation = false;
  }

  initializeObservables(): void {
    this.route.data.pipe(
      take(1),
    ).subscribe(data => {
      if (data.favorites) {
        this.displayType = DisplayType.Favorites;
        this.artists$ = this.library.getFavoriteArtists();
        this.albums$  = this.library.getFavoriteAlbums();
        this.tracks$  = this.library.getDisplayedFavorites();
      } else if (data.recent) {
        this.displayType = DisplayType.Recent;
        this.artists$ = this.library.getRecentArtists();
        this.albums$  = this.library.getRecentAlbums();
        this.tracks$  = this.library.getDisplayedRecentTracks();
      } else {
        this.displayType = DisplayType.Default;
        this.artists$ = this.library.getAllArtists();
        this.albums$  = this.library.getDisplayedAlbums();
        this.tracks$  = this.library.getDisplayedTracks();
      }
    });

    this.selectedArtists$ = this.library.getSelectedArtists();
    this.selectedAlbums$  = this.library.getSelectedAlbums();
    this.currentTrack$    = this.library.getCurrentTrack();
    this.shuffle$         = this.library.getShuffle();
    this.repeat$          = this.library.getRepeat();
    this.playlist$        = this.library.getPlaylist();
    this.playlists$       = this.library.getPlaylists();

    this.playing$         = this.library.getAudioPlaying();
    this.loading$         = this.library.getAudioLoading();
    this.volume$          = this.library.getAudioVolume();
    this.muted$           = this.library.getAudioMuted();
    this.duration$        = this.library.getAudioDuration();
    this.currentTime$     = this.library.getAudioCurrentTime();

    this.lyricsResult$ = combineLatest(this.currentTrack$, this.settings.getLyricsOptions()).pipe(
      filter(trackAndOpts => !!trackAndOpts[0]),
      switchMap(trackAndOpts => this.lyricsService.getLyrics(trackAndOpts[0], trackAndOpts[1])),
    );

    // Update the url based on the library state
    // if (this.library.selectedArtists.length > 0) {
    //   this.updateUrlDataFromArtists(this.library.selectedArtists);
    //   this.updateUrlDataFromAlbums(this.library.selectedAlbums);
    //   this.updateUrl();
    // }

    // When tracks are updated (e.g. on first visit) update the state based on the url
    // this.subscriptions.push(
    //   this.library.onTracksUpdated.subscribe(() => {
    //     this.route.paramMap.take(1).subscribe(params => this.updateState(params));
    //   })
    // );

    // Update the state on url change
    // this.subscriptions.push(
    //   this.route.paramMap.skip(1).subscribe(params => this.updateState(params))
    // );

    // On artist selection change update url
    // this.subscriptions.push(
    //   this.library.onArtistSelectionChanged.subscribe((artists) => {
    //     this.updateUrlDataFromArtists(artists);
    //     this.updateUrl();
    //   })
    // );

    // On album selection change update url
    // this.subscriptions.push(
    //   this.library.onAlbumSelectionChanged.subscribe(albums => {
    //     this.updateUrlDataFromAlbums(albums);
    //     this.updateUrl();
    //   })
    // );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // updateUrl() {
  //   const finalData = this.contentTranslation > 0 ? _.merge({t: this.contentTranslation}, this.urlData) : this.urlData;
  //   this.router.navigate(['/library', finalData]);
  // }

  translateContent(n: number) {
    this.contentTranslation = n;
    const updateUrl = () => this.routerService.getRouterState().pipe(
      take(1),
      filter((state: RouterStateUrl) => state.queryParams.get('t') !== n.toString()),
      tap(() => {
        let route;
        switch (this.displayType) {
          case DisplayType.Default:
            route = '/library';
            break;
          case DisplayType.Recent:
            route = '/recent';
            break;
          case DisplayType.Favorites:
            route = '/favorites';
            break;
        }
        this.router.navigate([route], { queryParams: { t: n.toString() }, queryParamsHandling: 'merge' });
      })
    ).subscribe();
    if (!environment.electron) {
      setTimeout(updateUrl);
    }
  }

}

export enum DisplayType {
  Default,
  Favorites,
  Recent
}
