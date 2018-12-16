import {Injectable} from '@angular/core';
import {HttpSocketClientService} from '@app/core/services/http-socket-client.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LyricsOptions, LyricsResult, Track} from '@app/model';
import {catchError, map, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {CoreUtils} from '@app/core/core.utils';

@Injectable()
export class LyricsService {


  constructor(
    private httpSocketClient: HttpSocketClientService,
    private httpClient: HttpClient,
    // private snack: MatSnackBar
  ) {}

  /*getLyrics2(track: Track): Observable<LyricsResult> {
    return this.httpSocketClient.get('/api/lyrics/' + encodeURI(track.artist) + '/' + encodeURI(track.title)).pipe(
      map((response: string) => ({
        lyrics: response,
        source: 'local'
      })),
      catchError(() => {
        return this.httpClient.get(this.lyricsOvhAPI + encodeURI(track.artist) + '/' + encodeURI(track.title)).pipe(
          map((response: any) => response.lyrics as string),
          // tap(lyrics => this.saveLyrics(lyrics, track.artist, track.title)),
          map(lyrics => ({
            lyrics: lyrics,
            source: 'lyrics.ovh'
          })),
        );
      }),
      catchError((error: HttpErrorResponse) =>
        of({ error: 'Lyrics not found' })
      )
    );
  }*/

  getLyrics(track: Track, opts: LyricsOptions): Observable<LyricsResult> {
    return this.geLyricsFromApi(track).pipe(
      map(lyrics => ({
        lyrics: lyrics,
        source: 'local'
      })),
      catchError(error => {
        if (opts.useService && opts.services.wikia) {
          return this.getLyricsFromWikia(track).pipe(
            map(lyrics => ({
              lyrics: lyrics,
              source: 'lyrics.wikia.com'
            }))
          );
        } else {
          throw error;
        }
      }),
      catchError(error => {
        if (opts.useService && opts.services.lyricsOvh) {
          return this.getLyricsFromLyricsOvh(track).pipe(
            map(lyrics => ({
              lyrics: lyrics,
              source: 'lyrics.ovh'
            }))
          );
        } else {
          throw error;
        }
      }),
      /*catchError(error => {
        console.log('Lyrics error -> ' + error.toString());
        throw error;
      }),*/
      catchError(() => of({
        error: 'No lyrics found.'
      })),
      tap((lyrics: LyricsResult) =>
        opts.automaticSave && lyrics.lyrics && lyrics.source !== 'local' ? this.saveLyrics(lyrics.lyrics, track.artist, track.title) : {}
      ),
    );
  }

  geLyricsFromApi(track: Track): Observable<string> {
    return this.httpSocketClient.get('/api/lyrics/' + encodeURI(track.artist) + '/' + encodeURI(track.title)).pipe(
      map((response: { lyrics: string }) => response.lyrics)
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

  saveLyrics(lyrics: string, artist: string, title: string) {
    this.httpSocketClient.post('/api/lyrics/' + encodeURI(artist) + '/' + encodeURI(title), { lyrics: lyrics }).subscribe(
      () => console.log('Lyrics saved!'), // this.snack.open('Lyrics saved!', 'OK', {duration: 2000}),
      error => console.log('Failed to save lyrics on the server: ' + error.error)
    );
  }

}
