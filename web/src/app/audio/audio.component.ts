import {Component, ElementRef, Input, OnInit, AfterViewInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnInit, AfterViewInit {

  @Input('source')
  source: string;
  volume = 1.0;
  muted = true;
  currentTime;
  duration;
  loading = false;
  playing = false;

  @ViewChild('audioElement')
  private audioElementRef: ElementRef;
  private audioElement: HTMLMediaElement;

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
      e => {
        this.loading = false;
        console.log(e);
        // TODO deal with errors
      }
    );
  }

  pause() {
    this.audioElement.pause();
  }

}
