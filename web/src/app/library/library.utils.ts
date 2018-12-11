import {Album, Artist, Track} from '@app/model';
import * as _ from 'lodash';
import {CoreUtils} from '@app/core/core.utils';

export class LibraryUtils {

  static fixTags(track: Track): Track {
    if (track.metadata.title === undefined || track.metadata.title === '') {
      const components = track.url.split('/');
      track.metadata.title = components[components.length - 1];
      track.warn = true;
    }
    if (track.metadata.albumArtist === undefined || track.metadata.albumArtist === '') {
      track.metadata.albumArtist = track.metadata.artist || 'Unknown Album Artist';
      track.warn = true;
    }
    if (track.metadata.artist === undefined || track.metadata.artist === '') {
      track.metadata.artist = 'Unknown Artist';
      track.warn = true;
    }
    if (track.metadata.album === undefined || track.metadata.album === '') {
      track.metadata.album = 'Unknown Album';
      track.warn = true;
    }
    if (track.coverUrl) {
      track.coverUrl = CoreUtils.resolveUrl(track.coverUrl);
    }
    return track;
  }

  static extractArtists(tracks: Track[]): Artist[] {
    const artists: Artist[] = [];
    _.forEach(tracks, track => {
      const artist = track.metadata.albumArtist;
      const artistIndex = _.findIndex(artists, a => a.name === artist);
      if (artistIndex === -1) {
        const newArtist: Artist = {name: artist, songs: 1};
        if (track.warn) { newArtist.warn = true; }
        if (track.coverUrl) { newArtist.avatarUrl = track.coverUrl; }
        artists.push(newArtist);
      } else {
        if (track.warn) { artists[artistIndex].warn = true; }
        if (track.coverUrl) { artists[artistIndex].avatarUrl = track.coverUrl; }
        artists[artistIndex].songs += 1;
      }
    });
    return artists;
  }

  static extractAlbums(tracks: Track[]): Album[] {
    const albums: Album[] = [];
    _.forEach(tracks, track => {
      const artist = track.metadata.albumArtist;
      const album = track.metadata.album;
      const albumIndex = _.findIndex(albums, a => a.title === album && a.artist === artist);
      if (albumIndex === -1) {
        const newAlbum: Album = {title: album, artist: artist, songs: 1};
        if (track.warn) { newAlbum.warn = true; }
        if (track.coverUrl) { newAlbum.avatarUrl = track.coverUrl; }
        albums.push(newAlbum);
      } else {
        if (track.warn) { albums[albumIndex].warn = true; }
        if (track.coverUrl) { albums[albumIndex].avatarUrl = track.coverUrl; }
        albums[albumIndex].songs += 1;
      }
    });
    return albums;
  }

  static shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

}
