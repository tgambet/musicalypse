import {Component, ElementRef, OnInit, AfterViewInit, ViewChild} from '@angular/core';

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



  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.audioElement = this.audioElementRef.nativeElement;
  }

  play() {
    this.audioElement.play().then(v => this.playing = true);
  }

  pause() {
    this.audioElement.pause();
    this.playing = false;
  }

}
