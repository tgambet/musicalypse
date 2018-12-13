import {Data, ParamMap, RouterStateSnapshot} from '@angular/router';
import {RouterStateSerializer} from '@ngrx/router-store';

export interface RouterStateUrl {
  url: string;
  params: ParamMap;
  queryParams: ParamMap;
  data: Data;
}

export class CustomSerializer implements RouterStateSerializer<RouterStateUrl> {
  serialize(routerState: RouterStateSnapshot): RouterStateUrl {
    let route = routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    // Only return an object including the URL, params and query params instead of the entire snapshot
    return {
      url: routerState.url,
      params: route.paramMap,
      queryParams: route.queryParamMap,
      data: route.data
    };
  }
}
