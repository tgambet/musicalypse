import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';

import * as fromCore from '@app/core/core.reducers';
import {Observable} from 'rxjs';
import {Theme} from '@app/core/core.utils';
import {ChangeTheme} from '@app/core/actions/core.actions';

@Injectable()
export class CoreService {

  constructor(
    private store: Store<fromCore.State>
  ) {

  }

  getCurrentTheme(): Observable<Theme> {
    return this.store.select(fromCore.getCurrentTheme);
  }

  changeTheme(theme: Theme): void {
    this.store.dispatch(new ChangeTheme(theme));
  }

  // TODO sidenav actions here

}
