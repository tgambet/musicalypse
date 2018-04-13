import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sgTime'
})
export class TimePipe implements PipeTransform {

  transform(value: number): string {

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor(value / 60) % 60;
    const seconds = Math.floor(value) % 60;

    function format(num: number) {
      return num.toString().padStart(2, '0');
    }

    let result = `${format(minutes)}:${format(seconds)}`;
    if (hours > 0) { result = format(hours) + ':' + result; }

    return result;
  }

}
