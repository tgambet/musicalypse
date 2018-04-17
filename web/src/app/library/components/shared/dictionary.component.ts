import {ChangeDetectionStrategy, Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-dictionary',
  template: `
    <nav class="alphabet">
      <ol>
        <li *ngFor="let letter of alphabet" (click)="letterClicked.emit(letter)">{{ letter }}</li>
      </ol>
    </nav>
  `,
  styles: [`
    nav {
      user-select: none;
      height: calc(100% - 132px);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      font-size: 10px;
      position: absolute;
      top: 60px;
      right: 21px;
    }
    ol {
      list-style-type: none;
      height: 100%;
      margin: 0;
      padding: 0;
    }
    li {
      text-align: center;
      cursor: pointer;
      height: calc(100% / 27);
    }

    @supports (-webkit-appearance:none) {
      nav {
        right: 9px;
      }
    }

    @media screen and (min-width: 1319px){
      nav {
        height: calc(100% - 60px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DictionaryComponent {

  @Output() letterClicked = new EventEmitter<string>();

  alphabet = [
    '#',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ];

}
