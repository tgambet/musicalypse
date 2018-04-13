import {Injectable} from '@angular/core';
import {Track} from '@app/model';
import * as _ from 'lodash';

@Injectable()
export class FavoritesService {

  private _favorites: Track[] = [];

  constructor() { }

  addToFavorites(track: Track) {
    if (!_.includes(this._favorites, track)) {
      this._favorites.push(track);
    }
  }

  removeFromFavorites(track: Track) {
    if (_.includes(this._favorites, track)) {
      _.remove(this._favorites, track);
    }
  }

  isFavorite(track: Track) {
    return _.includes(this._favorites, track);
  }

}
