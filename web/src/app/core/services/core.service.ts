import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';

import * as fromApp from '@app/app.reducers';
import {Observable} from 'rxjs';
import {Theme} from '@app/core/core.utils';
import {ChangeTheme} from '@app/core/core.actions';

@Injectable()
export class CoreService {

  constructor(
    private store: Store<fromApp.State>
  ) {

  }

  getCurrentTheme(): Observable<Theme> {
    return this.store.select(fromApp.getCurrentTheme);
  }

  changeTheme(theme: Theme): void {
    this.store.dispatch(new ChangeTheme(theme));
  }


}
