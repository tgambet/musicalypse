import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  template: `
    <div class="about">
      <h2>About</h2>
      <p class="bolder">Version 0.2.1</p>
      <p>
        Musicalypse is an open source software developed and maintained by Thomas GAMBET, available on all desktop platforms
        as an online or native version.
        You can support its development by <u>making a donation</u>, buying the windows version on the <u>Microsoft store</u>, or
        joining the development on <u>Github</u>.
      </p>
      <p>Find out more on <a href="http://www.musicalypse.com">www.musicalypse.com</a></p>
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
  `]
})
export class AboutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
