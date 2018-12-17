import {ChangeDetectionStrategy, Component} from '@angular/core';
import {environment} from '@env/environment';

@Component({
  selector: 'app-about',
  template: `
    <div class="about">
      <h2>About</h2>
      <h3 class="secondary-text">Version 0.5.2</h3>
      <p>
        <!--<img src="assets/logo_grey.svg" height="120" width="120" style="float: right; margin: 0 0 0.25rem 0.25rem;" alt="">-->
        Musicalypse is an open source software developed and maintained by Thomas Gambet, available on all desktop platforms
        as an online or native version. You can support its development by
        <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=E5XHFMS2RAYJN"
           target="_blank"
           (click)="openExternally($event)">making a donation</a>,
        buying the Windows version on the
        <a href="https://www.microsoft.com/store/apps/9MVSZGK1F230"
           target="_blank"
           (click)="openExternally($event)">Microsoft store</a>, or
        joining the development on
        <a href="https://github.com/tgambet/musicalypse"
           target="_blank"
           (click)="openExternally($event)">Github</a>.
      </p>
      <p>
        Find out more on
        <a href="https://musicalypse.creasource.net" target="_blank" (click)="openExternally($event)">https://musicalypse.creasource.net</a>
      </p>
      <!--<p>
        Contact: <a href="mailto:contact@creasource.net">contact@creasource.net</a>
      </p>-->
      <mat-divider style="clear: both;"></mat-divider>
      <h3 class="secondary-text">Contact</h3>
      <p>
        Please feel free to contact us for any bug reports, suggestions, or help requests by writing to
        <a href="mailto:contact@creasource.net">contact@creasource.net</a>.
      </p>
      <mat-divider></mat-divider>
      <h3 class="secondary-text">Contributors</h3>
      <ul>
        <li>Logo design: <a href="https://github.com/nunojesus" target="_blank" (click)="openExternally($event)">Nuno Jesus</a></li>
      </ul>
      <mat-divider></mat-divider>
      <h3 class="secondary-text">Privacy Policy</h3>
      <p>Musicalypse does not collect any personal information.</p>
      <p>
        For more information, please read our
        <a href="https://github.com/tgambet/musicalypse/blob/master/PRIVACY_POLICY.md"
           target="_blank"
           (click)="openExternally($event)">full privacy policy</a>
        on Github.
      </p>
      <mat-divider></mat-divider>
      <h3 class="secondary-text">License</h3>
      <p class="bolder">Copyright © 2018 Thomas Gambet</p>
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
      font-weight: 400;
      max-width: 900px;
    }
    .bolder {
      font-weight: 500;
    }
    ul {
      padding-left: 1rem;
    }
    mat-divider {
      margin: 1rem 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent {

  isElectron = environment.electron;

  openExternally(event: Event) {
    if (this.isElectron) {
      const shell = (<any>window).require('electron').shell;
      shell.openExternal(event.srcElement.getAttribute('href'));
      event.preventDefault();
    }
  }

}
