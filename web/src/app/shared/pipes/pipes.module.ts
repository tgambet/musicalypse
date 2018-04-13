import { NgModule } from '@angular/core';

import {FileSizePipe} from './file-size.pipe';
import {SearchPipe} from './search.pipe';
import {TimePipe} from './time.pipe';

export const PIPES = [
  FileSizePipe,
  SearchPipe,
  TimePipe
];

@NgModule({
  declarations: PIPES,
  exports: PIPES
})
export class PipesModule {}
