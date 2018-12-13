import {Album, Artist, Track} from '@app/model';
import {CoreUtils} from '@app/core/core.utils';

export class LibraryUtils {

  static fixTags(track: Track): Track {
    if (track.title === undefined || track.title === '') {
      const components = track.url.split('/');
      track.title = components[components.length - 1];
      // track.warn = true;
    }
    if (track.albumArtist === undefined || track.albumArtist === '') {
      track.albumArtist = track.artist || 'Unknown Album Artist';
      // track.warn = true;
    }
    if (track.artist === undefined || track.artist === '') {
      track.artist = 'Unknown Artist';
      // track.warn = true;
    }
    if (track.album === undefined || track.album === '') {
      track.album = 'Unknown Album';
      // track.warn = true;
    }
    if (track.coverUrl) {
      track.coverUrl = CoreUtils.resolveUrl(track.coverUrl);
    }
    return track;
  }

  static extractArtists(tracks: Track[]): Artist[] {
    const artists: Artist[] = [];
    tracks.forEach(track => {
      const artist = track.albumArtist;
      const artistIndex = artists.findIndex(a => a.name === artist);
      if (artistIndex === -1) {
        const newArtist: Artist = {name: artist, songs: 1};
        // if (track.warn) { newArtist.warn = true; }
        if (track.coverUrl) { newArtist.avatarUrl = track.coverUrl; }
        artists.push(newArtist);
      } else {
        // if (track.warn) { artists[artistIndex].warn = true; }
        if (track.coverUrl) { artists[artistIndex].avatarUrl = track.coverUrl; }
        artists[artistIndex].songs += 1;
      }
    });
    return artists;
  }

  static extractAlbums(tracks: Track[]): Album[] {
    const albums: Album[] = [];
    tracks.forEach(track => {
      const artist = track.albumArtist;
      const album = track.album;
      const albumIndex = albums.findIndex(a => a.title === album && a.artist === artist);
      if (albumIndex === -1) {
        const newAlbum: Album = {title: album, artist: artist, songs: 1};
        // if (track.warn) { newAlbum.warn = true; }
        if (track.coverUrl) { newAlbum.avatarUrl = track.coverUrl; }
        albums.push(newAlbum);
      } else {
        // if (track.warn) { albums[albumIndex].warn = true; }
        if (track.coverUrl) { albums[albumIndex].avatarUrl = track.coverUrl; }
        albums[albumIndex].songs += 1;
      }
    });
    return albums;
  }

  static shuffleArray<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  static uniq<T>(a: T[]): T[] {
    return a.filter((v, i, s) => s.indexOf(v) === i);
  }

  static uniqBy<T>(a: T[], p: (t: T) => any): T[] {
    const interMap = a.reduce(
      (map, item) => {
        const key = p(item);
        if (!map.has(key)) { map.set(key, item); }
        return map;
      },
      new Map()
    );
    return Array.from(interMap.values());
  }

}
