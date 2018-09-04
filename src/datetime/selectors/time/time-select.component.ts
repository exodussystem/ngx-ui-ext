import { ControlValueAccessor } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { Moment } from 'moment';
import { ValueAccessorProviderFactory, OnChangeHandler, OnTouchedHandler } from '../../../common/utils/provider-utils';
import { DateUtils } from '../common/date-utils';
import { TimeSelectorMode } from '../common/datetime.interface';

@Component({
    selector: 'ui-time-selector',
    providers: [ValueAccessorProviderFactory(UiTimeSelectorComponent)],
    template: `
        <ui-timestamp-selector *ngIf=" mode === 'time' " 
                            [(date)]="selectedDate"
                            [enabled]="enabled"
                            (periodChange)=" mode = $event">
        </ui-timestamp-selector>
        <ui-hour-selector *ngIf="mode === 'hour'"
                          [enabled]="enabled"
                          [selected]="selectedDate"
                          [(date)]="displayDate">
        </ui-hour-selector>
        <ui-minute-selector *ngIf="mode === 'minute'"
                            [enabled]="enabled"
                            [selected]="selectedDate"
                            [(date)]="displayDate">
        </ui-minute-selector>
    `
})
export class UiTimeSelectorComponent implements ControlValueAccessor {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _onChange: OnChangeHandler;
    private _onTouched: OnTouchedHandler;
    private _selectedDate: Moment;

    protected _displayDate: Moment = DateUtils.local();
    protected mode: TimeSelectorMode = 'time';

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input('enabled')
    public enabled: boolean = true;

    // -------------------------------------------------------------------------
    // Public Methods (Public API)
    // -------------------------------------------------------------------------

    get selectedDate(): Moment {
        return this._selectedDate;
    }

    set selectedDate(value: Moment) {
        if (value && value.isValid()) {
            let clone: Moment = value.clone();
            this._selectedDate = clone;
            this._displayDate = clone;
            this._onChange && this._onChange(clone);
        }
    }

    get displayDate(): Moment {
        if (!this._displayDate)
            this._displayDate = this.selectedDate || DateUtils.local();
        return this._displayDate;
    }

    set displayDate(value: Moment) {
        this.selectedDate = value;
        this.mode = 'time';
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    //
    // implements ControlValueAccessor
    //

    writeValue(val: string): void {
        if (val === null || val === undefined) {
            this._selectedDate = null;
        }
        else {
            let parsed = DateUtils.local(val);
            if (!parsed.isValid()) {
                parsed = null;
            }
            this._selectedDate = parsed;
        }
        this._displayDate = this.selectedDate || DateUtils.local();
    }

    registerOnChange(fn: OnChangeHandler): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: OnTouchedHandler): void {
        this._onTouched = fn;
    }
}
