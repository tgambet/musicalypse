import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sgSearch'
})
export class SearchPipe implements PipeTransform {

  transform(value: string, search?: string): any {
    if (!search) {
      return value;
    }
    const reg = RegExp(search, 'gi');
    return value.replace(reg, sub => `<span class="accent">${sub}</span>`);
  }

}
