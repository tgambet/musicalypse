import {ElementRef, Injectable, Renderer2} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subject} from 'rxjs';
import {filter, map, publishReplay, refCount, throttleTime} from 'rxjs/operators';

import * as fromCore from '@app/core/core.reducers';
import {
  SetAudioDuration,
  SetAudioError,
  SetAudioLoading,
  SetAudioMuted,
  SetAudioPlaying,
  SetAudioVolume
} from '@app/core/actions/audio.actions';

/**
 * Service configured by CoreComponent and in charge of creating and setting up the audio tag.
 */
@Injectable()
export class AudioService {

  private readonly currentTime$: Observable<number>;
  private readonly ended$: Observable<void>;

  private _appRoot: ElementRef;
  set appRoot(value: ElementRef) {
    this._appRoot = value;
  }

  private _renderer: Renderer2;
  set renderer(value: Renderer2) {
    this._renderer = value;
  }

  private _currentTime = new Subject<number>();
  private _ended = new Subject<void>();

  private audioElement: HTMLMediaElement;
  private listeners: (() => void)[] = [];

  constructor (
    private store: Store<fromCore.State>,
  ) {
    this.store.select(fromCore.getAudioInput).pipe(
      filter(audio => !!audio.source),
      map(audio => this.setAudio(audio.source, audio.volume, audio.muted))
    ).subscribe();

    this.currentTime$ = this._currentTime.asObservable().pipe(publishReplay(1), refCount(), throttleTime(100));
    this.ended$ = this._ended.asObservable();
  }

  play(): Promise<void> {
    if (this.audioElement) {
      return this.audioElement.play();
    }
  }

  pause(): void {
    if (this.audioElement) {
      return this.audioElement.pause();
    }
  }

  seekTo(time: number) {
    this.audioElement.currentTime = time;
    if (!this.isTimeInBuffer(time)) {
      this.store.dispatch(new SetAudioLoading(true));
    }
  }

  setMuted(muted: boolean) {
    this.store.dispatch(new SetAudioMuted(muted));
  }

  setVolume(volume: number) {
    this.store.dispatch(new SetAudioVolume(volume));
  }

  getMuted() {
    return this.store.select(fromCore.getAudioMuted);
  }

  getVolume() {
    return this.store.select(fromCore.getAudioVolume);
  }

  getPlaying() {
    return this.store.select(fromCore.getAudioPlaying);
  }

  getLoading() {
    return this.store.select(fromCore.getAudioLoading);
  }

  getDuration() {
    return this.store.select(fromCore.getAudioDuration);
  }

  getCurrentTime() {
    return this.currentTime$;
  }

  getEnded() {
    return this.ended$;
  }

  private isTimeInBuffer(time: number): boolean {
    for (let i = 0; i < this.audioElement.buffered.length; i++) {
      if (time >= this.audioElement.buffered.start(i) && time <= this.audioElement.buffered.end(i)) {
        return true;
      }
    }
    return false;
  }

  private setAudio(src: string, volume: number, muted: boolean): void {
    if (this.audioElement && this.audioElement.src === src) {
      this.audioElement.volume = volume;
      this.audioElement.muted = muted;
      return;
    }
    if (this.audioElement) {
      this._renderer.removeChild(this._appRoot, this.audioElement);
      this.listeners.forEach(listener => listener());
      setTimeout(() => this._currentTime.next(0));
    }
    this.audioElement = this.createAudioElement(src);
    this.audioElement.volume = volume;
    this.audioElement.muted = muted;
  }

  private createAudioElement(src: string): HTMLMediaElement {
    this.store.dispatch(new SetAudioLoading(true));
    const audio: HTMLMediaElement = this._renderer.createElement('audio');
    this._renderer.appendChild(this._appRoot.nativeElement, audio);
    audio.src = src;
    this.listeners.push(
      this._renderer.listen(audio, 'loadedmetadata', (event) => this.store.dispatch(new SetAudioDuration(event.target.duration))),
      this._renderer.listen(audio, 'timeupdate', (event) => this._currentTime.next(event.target.currentTime)),
      this._renderer.listen(audio, 'playing', () => this.store.dispatch(new SetAudioPlaying(true))),
      this._renderer.listen(audio, 'pause', () => this.store.dispatch(new SetAudioPlaying(false))),
      this._renderer.listen(audio, 'abort', () => this.store.dispatch(new SetAudioPlaying(false))),
      this._renderer.listen(audio, 'ended', () => this.store.dispatch(new SetAudioPlaying(false))),
      this._renderer.listen(audio, 'canplay', () => this.store.dispatch(new SetAudioLoading(false))),
      this._renderer.listen(audio, 'ended', () => this._ended.next()),
      this._renderer.listen(audio, 'error', (event) => {
        this.store.dispatch(new SetAudioLoading(false));
        this.store.dispatch(new SetAudioError(event.target.error));
        console.error('An audio error occurred!', event);
      })
    );
    return audio;
  }

}
