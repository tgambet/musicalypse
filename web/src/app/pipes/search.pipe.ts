import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sgSearch'
})
export class SearchPipe implements PipeTransform {

  transform(value: string, args?: string): any {
    if (!args) {
      return value;
    }
    const search = args;
    const reg = RegExp(search, 'gi');
    return value.replace(reg, (sub, arg) => `<span class="emphasize">${value.slice(arg, arg + search.length)}</span>`);
  }

}
