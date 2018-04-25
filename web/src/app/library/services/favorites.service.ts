import {Injectable} from '@angular/core';
import {Track} from '@app/model';
import {Store} from '@ngrx/store';

import * as fromLibrary from '../library.reducers';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AddToFavorites, RemoveFromFavorites} from '@app/library/actions/favorites.actions';

@Injectable()
export class FavoritesService {

  constructor(
    private store: Store<fromLibrary.State>
  ) { }

  addToFavorites(track: Track) {
    this.store.dispatch(new AddToFavorites(track));
  }

  removeFromFavorites(track: Track) {
    this.store.dispatch(new RemoveFromFavorites(track));
  }

  isFavorite(track: Track): Observable<boolean> {
    return this.store.select(fromLibrary.isFavorite(track));
  }

  getFavorites(): Observable<Track[]> {
    return this.store.select(fromLibrary.getFavorites).pipe(map(list => list.toJS()));
  }

}
