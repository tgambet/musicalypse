import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LibraryService} from '../services/library.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ArtistsComponent} from './artists/artists.component';
import {AlbumsComponent} from './albums/albums.component';
import {Subscription} from 'rxjs/Subscription';
import {LoaderService} from '../services/loader.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit, OnDestroy {

  @ViewChild('artistsComponent')
  artistsComponent: ArtistsComponent;

  @ViewChild('albumsComponent')
  albumsComponent: AlbumsComponent;

  subscriptions: Subscription[] = [];

  urlData: Object = {};

  contentTranslation = 0;

  noAnimation = false;
  animationTimeout;

  constructor(
    public library: LibraryService,
    public route: ActivatedRoute,
    private router: Router,
    public loader: LoaderService
  ) {

  }

  @HostListener('window:resize') onResize() {
    this.noAnimation = true;
    clearTimeout(this.animationTimeout);
    this.animationTimeout = setTimeout(() => this.noAnimation = false, 200);
  }

  ngOnInit() {
    this.subscriptions.push(
      this.library.onTracksUpdated.subscribe(() => {
        this.route.paramMap.subscribe((next: ParamMap) => {
          if (next.has('t')) {
            this.contentTranslation = +next.get('t');
          } else {
            this.contentTranslation = 0;
          }
          if (next.has('artists')) {
            const artists = next
              .get('artists')
              .split(',')
              .map(v => v.replace('%c%', ',').replace('%a%', '&'));
            this.artistsComponent.selectArtistsByName(artists);
          } else {
            this.artistsComponent.deselectAll();
          }
          if (next.has('albums')) {
            const artists = next
              .get('albums')
              .split(',')
              .map(v => v.replace('%c%', ',').replace('%a%', '&'));
            this.albumsComponent.selectAlbumsByName(artists);
          } else {
            this.albumsComponent.deselectAll();
          }
        });
      })
    );

    this.artistsComponent.onSelectionChange.subscribe(artists => {
      const oldData = _.clone(this.urlData);
      if (artists.length === 0) {
        delete this.urlData['artists'];
      } else {
        const artistsData = _.map(artists, artist => artist.name.replace(',', '%c%').replace('&', '%a%'));
        this.urlData['artists'] = _.sortBy(artistsData);
      }
      if (oldData['artists'] !== this.urlData['artists']) {
        this.updateUrl();
      }
    });
    this.albumsComponent.onSelectionChange.subscribe(albums => {
      const oldData = _.clone(this.urlData);
      if (albums.length === 0) {
        delete this.urlData['albums'];
      } else {
        const albumData = _.map(albums, album => album.title.replace(',', '%c%').replace('&', '%a%'));
        this.urlData['albums'] = _.sortBy(albumData);
      }
      if (oldData['albums'] !== this.urlData['albums']) {
        this.updateUrl();
      }
    });
  }

  ngOnDestroy() {
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  updateUrl() {
    const finalData = this.contentTranslation > 0 ? _.merge({t: this.contentTranslation}, this.urlData) : this.urlData;
    this.router.navigate(['/library', finalData]);
  }

  translateContent(n: number) {
    this.contentTranslation = n;
    this.updateUrl();
  }

}
