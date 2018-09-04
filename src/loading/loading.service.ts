/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 1/25/2017.
 */

import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs/Rx";

@Injectable()
export class LoadingService {

    // -------------------------------------------------------------------------
    // Public Properties
    // -------------------------------------------------------------------------

    // global view constant
    public static APP_VIEW: string = 'app-view';

    // -------------------------------------------------------------------------
    // Private Properties
    // -------------------------------------------------------------------------

    // Observable source
    private _viewLoadingMap: Map<string, BehaviorSubject<boolean>> = new Map();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {
        let appViewSubject = new BehaviorSubject<boolean>(false);
        this._viewLoadingMap.set(LoadingService.APP_VIEW, appViewSubject);
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    setViewLoading(isLoading: boolean, viewId: string = LoadingService.APP_VIEW) {
        let viewSubject: BehaviorSubject<boolean> = this._getViewSubject(isLoading, viewId);
        viewSubject.next(isLoading);
    }

    getViewLoadingObservable(viewId: string = LoadingService.APP_VIEW): Observable<boolean> {
        let viewSubject: BehaviorSubject<boolean> = this._getViewSubject(false, viewId);
        return viewSubject.asObservable();
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    /**
     * Get View subject associated with viewId.
     * If not found, create new one with initValue and return it.
     *
     * @param initValue
     * @param viewId
     * @private
     */
    private _getViewSubject(initValue: boolean, viewId: string): BehaviorSubject<boolean> {
        // lookup in the map first
        let viewSubject: BehaviorSubject<boolean> = this._viewLoadingMap.get(viewId);

        // not existed yet, create new one
        if (!viewSubject) {
            viewSubject = new BehaviorSubject<boolean>(initValue);
            // add to the map
            this._viewLoadingMap.set(viewId, viewSubject);
        }
        return viewSubject;
    }
}
