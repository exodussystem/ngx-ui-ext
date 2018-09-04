/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 9/14/2017.
 */

import { Moment } from 'moment';

export type DateTimeSelectorType = 'date' | 'datetime' | 'time';

export type DateSelectorMode = 'day' | 'month' | 'year' | 'decade';

export type DateDisplayMode = 'day' | 'month' | 'year';

export type TimeSelectorMode = 'time' | 'hour' | 'minute';

export interface IDate {
    text: string;
    date: Moment;
    selected: boolean;
    active: boolean;
    disabled: boolean;
    mode?: string;
}

export interface IDateTimeSettings {
    format?: string;
    placement?: string;

    minDate?: any;
    maxDate?: any;

    allowClear?: boolean;
    autofill?: boolean;
    highlightToday?: boolean;
    bodyContainer?: boolean;
    closeOnSelect?: boolean;
    supportKeyboard?: boolean;
    // tabMode?: boolean;
    disabledDates?: Array<string|Date|Moment>;

    iconClass?: {
        time?: string;
        date?: string;
        up?: string;
        down?: string;
        previous?: string;
        next?: string;
        today?: string;
        clear?: string;
        close?: string;
    },

    showTooltip?: boolean;
    tooltipText?: {
        today?: string;
        clear?: string;
        close?: string;
        selectMonth?: string;
        prevMonth?: string;
        nextMonth?: string;
        selectYear?: string;
        prevYear?: string;
        nextYear?: string;
        selectDecade?: string;
        prevDecade?: string;
        nextDecade?: string;
        prevCentury?: string;
        nextCentury?: string;
        pickHour?: string;
        incrementHour?: string;
        decrementHour?: string;
        pickMinute?: string;
        incrementMinute?: string;
        decrementMinute?: string;
        pickSecond?: string;
        incrementSecond?: string;
        decrementSecond?: string;
        togglePeriod?: string;
        selectTime?: string;
    }
}

export const DEFAULT_DATETIME_SETTINGS: IDateTimeSettings = {

    // format: 'MM/DD/YYYY',
    format: 'MM/DD/YYYY hh:mm A',
    placement: 'top left',

    allowClear: true,
    autofill: false,
    highlightToday: true,
    bodyContainer: true,
    supportKeyboard: false,
    closeOnSelect: true,
    // tabMode: true,

    iconClass: {
        time: 'fa fa-time',
        date: 'fa fa-calendar',
        up: 'fa fa-chevron-up',
        down: 'fa fa-chevron-down',
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-screenshot',
        clear: 'fa fa-trash',
        close: 'fa fa-remove'
    },
    showTooltip: true,
    tooltipText: {
        today: 'Go to today',
        clear: 'Clear selection',
        close: 'Close the picker',
        selectMonth: 'Select Month',
        prevMonth: 'Previous Month',
        nextMonth: 'Next Month',
        selectYear: 'Select Year',
        prevYear: 'Previous Year',
        nextYear: 'Next Year',
        selectDecade: 'Select Decade',
        prevDecade: 'Previous Decade',
        nextDecade: 'Next Decade',
        prevCentury: 'Previous Century',
        nextCentury: 'Next Century',
        pickHour: 'Pick Hour',
        incrementHour: 'Increment Hour',
        decrementHour: 'Decrement Hour',
        pickMinute: 'Pick Minute',
        incrementMinute: 'Increment Minute',
        decrementMinute: 'Decrement Minute',
        pickSecond: 'Pick Second',
        incrementSecond: 'Increment Second',
        decrementSecond: 'Decrement Second',
        togglePeriod: 'Toggle Period',
        selectTime: 'Select Time'
    }
}