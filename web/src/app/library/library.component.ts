import {AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LibraryService} from '../services/library.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ArtistsComponent} from './artists/artists.component';
import {AlbumsComponent} from './albums/albums.component';
import {LoaderService} from '../services/loader.service';
import {Album, Artist} from '../model';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/skip';
import * as _ from 'lodash';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit, OnDestroy, AfterViewInit {

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
    private router: Router,
  ) {

  }

  @HostListener('window:resize') onResize() {
    this.noAnimation = true;
    clearTimeout(this.animationTimeout);
    this.animationTimeout = setTimeout(() => this.noAnimation = false, 200);
  }

  updateUrlDataFromArtists(artists: Artist[]) {
    if (artists.length === 0) {
      delete this.urlData['artists'];
    } else {
      const artistsData = _.map(artists, artist => artist.name.replace(',', '%c%').replace('&', '%a%'));
      this.urlData['artists'] = _.sortBy(artistsData);
    }
  }

  updateUrlDataFromAlbums(albums: Album[]) {
    if (albums.length === 0) {
      delete this.urlData['albums'];
    } else {
      const albumData = _.map(albums, album => album.title.replace(',', '%c%').replace('&', '%a%'));
      this.urlData['albums'] = _.sortBy(albumData);
    }
  }

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

    // Update the url based on the library state
    if (this.library.selectedArtists.length > 0) {
      this.updateUrlDataFromArtists(this.library.selectedArtists);
      this.updateUrlDataFromAlbums(this.library.selectedAlbums);
      this.updateUrl();
    }

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

  ngAfterViewInit() {

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
