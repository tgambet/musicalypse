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

  playing = false;

  @Input('autoplay') autoplay = false;
  @Input('source')   source: string;
  @Input('volume')   volume = 1.0;
  @Input('muted')    muted = false;
  @Input('currentTime') currentTime = 0;
  duration = 1;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.audioElement = this.audioElementRef.nativeElement;
    this.audioElement.addEventListener(
      'loadedmetadata',
      m => {
        this.duration = m.target['duration'];
      }
    );
    this.audioElement.addEventListener(
      'timeupdate',
      m => {
        this.currentTime = m.target['currentTime'];
      }
    );
  }

  seekTo(time: number) {
    this.audioElement.currentTime = time;
  }

  play() {
    this.audioElement.play().then(v => this.playing = true);
  }

  pause() {
    this.audioElement.pause();
    this.playing = false;
  }

}
