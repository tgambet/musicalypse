import {Injectable} from '@angular/core';
import {HttpSocketClientService} from '@app/core/services/http-socket-client.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LyricsOptions, Track} from '@app/model';
import {catchError, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {CoreUtils} from '@app/core/core.utils';
import {Store} from '@ngrx/store';
import * as fromLibrary from '@app/library/library.reducers';

@Injectable()
export class LyricsService {


  constructor(
    private httpSocketClient: HttpSocketClientService,
    private httpClient: HttpClient,
    private store: Store<fromLibrary.State>
  ) {}

  requestLyrics(track: Track, opts: LyricsOptions): Observable<[string, string]> {
    return this.geLyricsFromApi(track).pipe(
      map(lyrics => [lyrics, 'local'] as [string, string]),
      catchError(error => {
        if (opts.useService && opts.services.wikia) {
          return this.getLyricsFromWikia(track).pipe(
            map(lyrics => [lyrics, 'lyrics.wikia.com'] as [string, string])
          );
        } else {
          throw error;
        }
      }),
      catchError(error => {
        if (opts.useService && opts.services.lyricsOvh) {
          return this.getLyricsFromLyricsOvh(track).pipe(
            map(lyrics => [lyrics, 'lyrics.ovh'] as [string, string])
          );
        } else {
          throw error;
        }
      }),
    );
  }

  geLyricsFromApi(track: Track): Observable<string> {
    return this.httpSocketClient.get('/api/lyrics/' + encodeURI(track.artist) + '/' + encodeURI(track.title)).pipe(
      map((response: { lyrics: string }) => response.lyrics),
      catchError((error: HttpErrorResponse) => { throw new Error(error.message); })
    );
  }

  getLyricsFromWikia(track: Track): Observable<string> {
    const url = 'http://lyrics.wikia.com/wiki/' +
      encodeURIComponent(track.artist.replace(/ /g, '_')) + ':' +
      encodeURIComponent(track.title.replace(/ /g, '_'));
    const finalUrl = CoreUtils.resolveUrl('/api/proxy/' + encodeURIComponent(url));
    const parser = new DOMParser();
    return this.httpClient.get(finalUrl, { responseType: 'text'}).pipe(
      catchError((httpErrorResponse: HttpErrorResponse) => { throw new Error(httpErrorResponse.message); }),
      map((response: string) => parser.parseFromString(response, 'text/html')),
      map((document: HTMLDocument) => document.querySelector('.lyricbox')),
      map(elem => { if (!elem) { throw new Error('Lyrics box not found!'); } else { return elem; } }),
      map(elem => elem.innerHTML
        .trim()
        .replace(/<br>/g, '\n')
        .replace(/<.*?>/g, '')
        .replace(/<div class="lyricsbreak"><\/div>/, '')
      ),
      map(lyrics => {
        if (lyrics.includes('Unfortunately, we are not licensed to display the full lyrics for this song')) {
          throw new Error('No license for this song');
        } else {
          return lyrics;
        }
      })
    );
  }

  getLyricsFromLyricsOvh(track: Track): Observable<string> {
    return this.httpClient.get('https://api.lyrics.ovh/v1/' + encodeURI(track.artist) + '/' + encodeURI(track.title)).pipe(
      catchError((httpErrorResponse: HttpErrorResponse) => { throw new Error(httpErrorResponse.message); }),
      map((response: { lyrics: string }) => response.lyrics),
      map(lyrics => lyrics
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n')
        .split('\n')
        .map(line => line.trim())
        .join('\n')
      ),
      // FIX: since lyrics.ovh looks on wikia.com too this might happen:
      map(lyrics => {
        if (lyrics.includes('Unfortunately, we are not licensed to display the full lyrics for this song')) {
          throw new Error('No license for this song');
        } else {
          return lyrics;
        }
      })
    );
  }

  saveLyrics(lyrics: string, artist: string, title: string): void {
    this.httpSocketClient.post('/api/lyrics/' + encodeURI(artist) + '/' + encodeURI(title), { lyrics: lyrics }).subscribe(
      () => console.log('Lyrics saved!'), // this.snack.open('Lyrics saved!', 'OK', {duration: 2000}),
      error => console.log('Failed to save lyrics on the server: ' + error.error)
    );
  }

  getLyrics(): Observable<string> {
    return this.store.select(fromLibrary.getLyrics);
  }

  getLoading(): Observable<boolean> {
    return this.store.select(fromLibrary.getLyricsLoading);
  }

  getError(): Observable<string> {
    return this.store.select(fromLibrary.getLyricsError);
  }

  getSource(): Observable<string> {
    return this.store.select(fromLibrary.getLyricsSource);
  }

}
