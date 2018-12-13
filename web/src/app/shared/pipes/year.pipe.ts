import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'sgYear'
})
export class YearPipe implements PipeTransform {

  transform(value: string): string {
    if (value && value.length > 4) {
      return value.substr(0, 4);
    } else {
      return value;
    }
  }

}
