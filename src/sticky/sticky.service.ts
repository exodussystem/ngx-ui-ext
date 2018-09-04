/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/23/2017.
 */

import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs/Rx";

export interface IStickySubject {
    event: 'stickyUpdate' | 'sizeUpdate';
    sticky: boolean;
    stickyTop?: number;
    stickyHeight?: number;
    contentTop?: number;
    contentBottom?: number;
}

@Injectable()
export class UiStickyService {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _stateChanged: Observable<IStickySubject>;

    // source of observable
    private _stateChangedSource: BehaviorSubject<IStickySubject> =
                                    new BehaviorSubject<IStickySubject>(null);

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {
        this._stateChanged = this._stateChangedSource.asObservable();
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    // notify the the state change
    public notify(change: IStickySubject): void {
        this._stateChangedSource.next(change);
    }

    // get the state changed observable
    public getStateChanged(): Observable<IStickySubject> {
        return this._stateChanged;
    }
}