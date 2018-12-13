import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';

import * as fromRoot from '@app/app.reducers';
import {RouterStateUrl} from '@app/app.serializer';
import {getRouterState} from '@app/app.reducers';

@Injectable()
export class RouterService {

  constructor(
    private store: Store<fromRoot.State>
  ) {
  }

  getRouterState(): Observable<RouterStateUrl> {
    return this.store.select(getRouterState);
  }

}
