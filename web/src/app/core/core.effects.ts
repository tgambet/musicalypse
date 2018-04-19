import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {ChangeTheme, CoreActionTypes} from '@app/core/core.actions';
import {OverlayContainer} from '@angular/cdk/overlay';
import {PersistenceService} from '@app/core/services/persistence.service';

@Injectable()
export class CoreEffects {

  @Effect({ dispatch: false })
  themes$: Observable<void> =
    this.actions$.pipe(
      ofType<ChangeTheme>(CoreActionTypes.ChangeTheme),
      tap((action: ChangeTheme) => {
        this.overlayContainer.getContainerElement().className = 'cdk-overlay-container ' + action.payload.cssClass;
        PersistenceService.save('theme', JSON.stringify(action.payload));
      }),
      map(() => {})
    );

  constructor(
    private actions$: Actions,
    private overlayContainer: OverlayContainer
  ) {}

}
