import {Component, OnInit} from '@angular/core';
import {environment} from '@env/environment';

@Component({
  selector: 'app-about',
  template: `
    <div class="about">
      <h2>About</h2>
      <p class="bolder">Version 0.3.0</p>
      <p>
        <img src="assets/logo_grey.svg" height="100" style="float: left; margin: 0 1rem 1rem 0;">
        Musicalypse is an open source software developed and maintained by Thomas GAMBET, available on all desktop platforms
        as an online or native version. You can support its development by
        <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=E5XHFMS2RAYJN"
           target="_blank"
           (click)="openExternally($event)">making a donation</a>,
        buying the windows version on the <u>Microsoft store</u>, or
        joining the development on
        <a href="https://github.com/tgambet/musicalypse"
           target="_blank"
           (click)="openExternally($event)">Github</a>.
      </p>
      <p>
        Find out more on
        <a href="https://musicalypse.creasource.net" target="_blank" (click)="openExternally($event)">https://musicalypse.creasource.net</a>
      </p>
      <h3 style="clear: both;">Contributors</h3>
      <ul>
        <li>Logo design: <a href="https://github.com/nunojesus" target="_blank" (click)="openExternally($event)">Nuno Jesus</a></li>
      </ul>
      <h3>License</h3>
      <p class="bolder">Copyright © 2018 Thomas GAMBET</p>
      <p>
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
      </p>
      <p>
        The above copyright notice and this permission notice shall be included in all
        copies or substantial portions of the Software.
      </p>
      <p>
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
        SOFTWARE.
      </p>
    </div>
  `,
  styles: [`
    .about {
      padding: 0.5rem 1rem;
      font-weight: 300;
    }
    .bolder {
      font-weight: 500;
    }
    ul {
      padding-left: 1rem;
    }
  `]
})
export class AboutComponent implements OnInit {

  isElectron = environment.electron;

  constructor() { }

  ngOnInit() {
  }

  openExternally(event: Event) {
    if (this.isElectron) {
      const shell = (<any>window).require('electron').shell;
      shell.openExternal(event.srcElement.getAttribute('href'));
      event.preventDefault();
    }
  }

}
