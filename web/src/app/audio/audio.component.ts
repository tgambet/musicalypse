import {Component, ElementRef, Input, OnInit, AfterViewInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnInit, AfterViewInit {

  audioElement: HTMLMediaElement;

  @ViewChild('audioElement')
  audioElementRef: ElementRef;

  @Input('autoplay') autoplay = false;
  @Input('source')   source: string;
  @Input('volume')   volume = 1.0;
  @Input('muted')    muted = false;
  @Input('currentTime') currentTime = 0;
  duration = 1;
  loading = false;
  playing = false;
  // progress = 0;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.audioElement = this.audioElementRef.nativeElement;
    this.audioElement.addEventListener(
      'loadedmetadata',
      m => this.duration = m.target['duration']
    );
    this.audioElement.addEventListener(
      'timeupdate',
      m => this.currentTime = m.target['currentTime']
    );
    this.audioElement.addEventListener(
      'playing',
      m => this.playing = true
    );
    this.audioElement.addEventListener(
      'pause',
      m => this.playing = false
    );
    this.audioElement.addEventListener(
      'ended',
      m => this.playing = false
    );
    this.audioElement.addEventListener(
      'abort',
      m => this.playing = false
    );
    // this.audioElement.addEventListener(
    //   'progress',
    //   m => {
    //     const buffer = this.audioElement.buffered;
    //     if (buffer.length > 0) {
    //       const bufferEnd = buffer.end(buffer.length - 1);
    //       this.progress = (bufferEnd / this.duration) * 100;
    //     }
    //   }
    // );
  }

  seekTo(time: number) {
    this.audioElement.currentTime = time;
  }

  play() {
    this.loading = true;
    // TODO deal with errors
    this.audioElement.play().then(
      e => { this.loading = false; },
      e => {}// console.log(e)
    );
  }

  pause() {
    this.audioElement.pause();
  }

}
