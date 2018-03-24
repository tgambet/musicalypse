import {Component, ElementRef, OnInit, AfterViewInit, ViewChild, Output, EventEmitter} from '@angular/core';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnInit, AfterViewInit {

  source: string;
  volume = 1.0;
  muted = false;
  currentTime;
  duration;
  loading = false;
  playing = false;

  @Output()
  onPlayEnd = new EventEmitter<void>();

  @ViewChild('audioElement')
  private audioElementRef: ElementRef;
  private audioElement: HTMLMediaElement;

  constructor(public snackBar: MatSnackBar) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.audioElement = this.audioElementRef.nativeElement;
  }

  seekTo(time: number) {
    this.audioElement.currentTime = time;
    if (!this.isTimeInBuffer(time)) {
      this.loading = true;
    }
  }

  isTimeInBuffer(time: number): boolean {
    for (let i = 0; i < this.audioElement.buffered.length; i++) {
      if (time >= this.audioElement.buffered.start(i) && time <= this.audioElement.buffered.end(i)) {
        return true;
      }
    }
    return false;
  }

  play() {
    this.audioElement.play().then(
      () => {},
      (e: Error) => {
        this.snackBar.open('An error occurred: ' + e.message, '', { duration: 2000 });
        this.loading = false;
      }
    );
  }

  pause() {
    this.audioElement.pause();
  }

  setSource(source: string) {
    if (this.source !== source) {
      this.source = source;
      if (source !== '') {
        this.loading = true;
      } else {
        this.duration = null;
      }
    }
  }

  onError(e) {
    this.snackBar.open('An error occurred: ' + e.target.error.message, '', { duration: 2000 });
    this.loading = false;
  }

}
