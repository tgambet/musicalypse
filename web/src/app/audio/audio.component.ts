import {Component, ElementRef, Input, OnInit, AfterViewInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnInit, AfterViewInit {

  @ViewChild('audioElement')
  audioElementRef: ElementRef;
  audioElement: HTMLMediaElement;

  @Input('source') source: string;
  volume = 1.0;
  muted = true;
  currentTime = 0;
  duration = 1;
  loading = false;
  playing = false;

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.audioElement = this.audioElementRef.nativeElement;
  }

  seekTo(time: number) {
    this.audioElement.currentTime = time;
  }

  play() {
    this.loading = true;
    this.audioElement.play().then(
      () => { this.loading = false; },
      e => { console.log(e); }
    );
  }

  pause() {
    this.audioElement.pause();
  }

}
