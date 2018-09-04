/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 9/13/2017.
 */

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';
import { DEFAULT_DATETIME_SETTINGS, IDateTimeSettings } from './datetime.interface';
import { Moment } from 'moment';
import { DateUtils } from './date-utils';
import { RandomUtils } from '../../../common/utils';

export interface IDateSelectEvent {
    // event name
    eventName: string;
    date?: Moment;
    setFocus?: boolean;
}

@Injectable()
export class UiDateTimeState {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    public id: string;

    public minDate: Moment;

    public maxDate: Moment;

    public settings: IDateTimeSettings = Object.assign({}, DEFAULT_DATETIME_SETTINGS);

    public popup: boolean = false;

    // Observable sources
    public dateChangeSource: Subject<IDateSelectEvent> = new Subject<IDateSelectEvent>();

    // Observable streams
    public dateChange$: Observable<IDateSelectEvent> = this.dateChangeSource.asObservable();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {
        this.id = RandomUtils.getUUID();

    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    setSettings(value: IDateTimeSettings) {

        this.settings = Object.assign({}, DEFAULT_DATETIME_SETTINGS, value);

        if (this.settings.minDate || this.minDate) {

            let minDate: Moment = null;
            if (this.settings.minDate) {
                minDate = DateUtils.local(this.settings.minDate);
                // needUpdate = (!this.minDate || this.minDate.isBefore(minDate));
            }

            this.minDate = minDate;
            this.dateChangeSource.next({
                eventName: 'minDate',
                date: minDate
            });
        }

        if (this.settings.maxDate || this.maxDate) {

            let maxDate: Moment = null;
            if (this.settings.maxDate) {
                maxDate = DateUtils.local(this.settings.maxDate);
                // needUpdate = (!this.maxDate || this.maxDate.isAfter(maxDate));
            }
            this.maxDate = maxDate;
            this.dateChangeSource.next({
                eventName: 'maxDate',
                date: maxDate
            });
        }
    }

    onDestroy(): void {
        // release all object references
        this.settings = null;
        this.dateChangeSource = null;
    }
}