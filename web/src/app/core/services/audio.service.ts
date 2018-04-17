import {ElementRef, Injectable, Renderer2} from '@angular/core';
import {Observable, Subject} from 'rxjs';

/**
 * Service configured by AppComponent and in charge of creating and setting up the audio tag.
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

  private listeners: (() => void)[];

  constructor () {
    this.volume$ = this._volume.asObservable();
    this.muted$ = this._muted.asObservable();
    this.currentTime$ = this._currentTime.asObservable();
    this.duration$ = this._duration.asObservable();
    this.loading$ = this._loading.asObservable().publishLast().refCount();
    this.playing$ = this._playing.asObservable().publishLast().refCount();
    this._volume.next(this.volume);
    this._muted.next(this.muted);
    this._loading.next(false);
    this._playing.next(false);
  }

  play(src: string): Promise<void> {
    if (this.audioElement) {
      this._renderer.removeChild(this._appRoot, this.audioElement);
      this.listeners.forEach(listener => listener());
    }
    this._playing.next(false);
    this._loading.next(true);
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
      this._renderer.setAttribute(this.audioElement, 'volume', volume.toString());
    }
  }

  mute() {
    if (this.audioElement) {
      this._renderer.setAttribute(this.audioElement, 'muted', 'true');
    }
  }

  unmute() {
    if (this.audioElement) {
      this._renderer.setAttribute(this.audioElement, 'muted', 'false');
    }
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
    this._renderer.setAttribute(audio, 'src', src);
    this._renderer.setAttribute(audio, 'volume', this.volume.toString());
    this._renderer.setAttribute(audio, 'muted', this.muted.toString());
    // this._renderer.listen(audio, '', (event) => {})
    return audio;
  }

}
