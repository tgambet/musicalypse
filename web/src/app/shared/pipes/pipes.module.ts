import {NgModule} from '@angular/core';

import {FileSizePipe} from './file-size.pipe';
import {SearchPipe} from './search.pipe';
import {TimePipe} from './time.pipe';
import {YearPipe} from './year.pipe';

export const PIPES = [
  FileSizePipe,
  SearchPipe,
  TimePipe,
  YearPipe
];

@NgModule({
  declarations: PIPES,
  exports: PIPES
})
export class PipesModule {}
