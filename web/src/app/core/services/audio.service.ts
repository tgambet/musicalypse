import {ElementRef, Injectable, Renderer2} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {throttleTime} from 'rxjs/operators';

/**
 * Service configured by CoreComponent and in charge of creating and setting up the audio tag.
 */
@Injectable()
export class AudioService {

  private volume = 1.0;
  private muted = false;

  volume$: Observable<number>;
  muted$: Observable<boolean>;
  currentTime$: Observable<number>;
  duration$: Observable<number>;
  loading$: Observable<boolean>;
  playing$: Observable<boolean>;

  private _renderer: Renderer2;
  private _appRoot: ElementRef;

  set appRoot(value: ElementRef) {
    this._appRoot = value;
  }
  set renderer(value: Renderer2) {
    this._renderer = value;
  }

  private _volume = new Subject<number>();
  private _muted = new Subject<boolean>();
  private _currentTime = new Subject<number>();
  private _duration = new Subject<number>();
  private _loading = new Subject<boolean>();
  private _playing = new Subject<boolean>();

  private audioElement: HTMLMediaElement;

  private listeners: (() => void)[] = [];

  constructor () {
    this.volume$ = this._volume.asObservable();
    this.muted$ = this._muted.asObservable();
    this.currentTime$ = this._currentTime.asObservable().pipe(throttleTime(200));
    this.duration$ = this._duration.asObservable();
    this.loading$ = this._loading.asObservable();
    this.playing$ = this._playing.asObservable();
    this._volume.next(this.volume);
    this._muted.next(this.muted);
    this._loading.next(false);
    this._playing.next(false);
  }

  play(src: string): Promise<void> {
    this._volume.next(this.volume);
    this._muted.next(this.muted);
    if (this.audioElement) {
      this._renderer.removeChild(this._appRoot, this.audioElement);
      this.listeners.forEach(listener => listener());
    }
    this._playing.next(false);
    this._loading.next(true);
    this._currentTime.next(0);
    this.audioElement = this.createAudioElement(src);
    return this.audioElement.play();
  }

  pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  resume() {
    if (this.audioElement) {
      this.audioElement.play();
    }
  }

  setVolume(volume: number) {
    if (this.audioElement) {
      this.audioElement.volume = volume;
    }
    this.volume = volume;
    this._volume.next(this.volume);
  }

  mute() {
    if (this.audioElement) {
      this.audioElement.muted = true;
    }
    this.muted = true;
    this._muted.next(this.muted);
  }

  unmute() {
    if (this.audioElement) {
      this.audioElement.muted = false;
    }
    this.muted = false;
    this._muted.next(this.muted);
  }

  seekTo(time: number) {
    this.audioElement.currentTime = time;
    if (!this.isTimeInBuffer(time)) {
      this._loading.next(true);
      // this.loading = true;
    }
  }

  private isTimeInBuffer(time: number): boolean {
    for (let i = 0; i < this.audioElement.buffered.length; i++) {
      if (time >= this.audioElement.buffered.start(i) && time <= this.audioElement.buffered.end(i)) {
        return true;
      }
    }
    return false;
  }

  private createAudioElement(src: string): HTMLMediaElement {
    const audio: HTMLMediaElement = this._renderer.createElement('audio');
    this._renderer.appendChild(this._appRoot.nativeElement, audio);
    // this._renderer.setAttribute(audio, 'src', src);
    audio.src = src;
    audio.volume = this.volume;
    audio.muted = this.muted;
    this.listeners.push(
      this._renderer.listen(audio, 'loadedmetadata', (event) => this._duration.next(event.target.duration)),
      this._renderer.listen(audio, 'timeupdate', (event) => this._currentTime.next(event.target.currentTime)),
      this._renderer.listen(audio, 'playing', () => this._playing.next(true)),
      this._renderer.listen(audio, 'pause', () => this._playing.next(false)),
      this._renderer.listen(audio, 'abort', () => this._playing.next(false)),
      this._renderer.listen(audio, 'ended', () => this._playing.next(false)),
      this._renderer.listen(audio, 'canplay', () => this._loading.next(false))
      // this._renderer.listen(audio, 'error', () => this._loading.next(false))
    );
    return audio;
  }

}
