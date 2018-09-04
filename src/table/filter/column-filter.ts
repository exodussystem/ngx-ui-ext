/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/4/2017.
 */

import { ITableFilterConfig } from './table-filters';
import { UiTablePlugin } from '../config/table-plugin';
import { ISelectSettings} from '../../select/select/select.interface';

// Pre-Defined filters
export const  BUILTIN_COLUMN_FILTERS = {
    STRING: 'string',
    NUMBER: 'number',
    DATE: 'date',
    ENUM: 'enum'
}

export interface IColumnFilter {
    // perform filtering
    doFilter: (filterValue: any, value: any, row: Object) => boolean;

    // given the current value of filterValue, returns true or false based on
    // whether that value is considered "active"
    isActive: (filterValue: any) => boolean;
}

// column filter configuration
export interface IColumnFilterConfig extends ITableFilterConfig {
    key?: string;                       // the property name in raw data
    filterDisplayText?: boolean;        // true if filtering display text instead of value
    // settings to filter by table (globally)
    filterType?: any;                   // filter type (default is 'text') when filtering globally
    // settings to filter by column
    columnFilterType?: any;             // filter type (used to look up UiTablePlugin) when filtering by column
    columnFilterInput?: 'text'|'select';// input type (free text or drop down)

    // configurations when columnFilterInput is 'select'
    filterSelection?: any;              // selected options
    selectOptions?: any[];              // select dropdown options
    selectSettings?: ISelectSettings;   // select settings
}

//
// BUILT-IN FILTERS
//

// For date filter
const unitmap: Object = {};
unitmap['second'] = unitmap['sec'] = unitmap['s'] = 1000;
unitmap['minute'] = unitmap['min'] = unitmap['m'] = unitmap['second'] * 60;
unitmap['hour'] = unitmap['hr'] = unitmap['h'] = unitmap['minute'] * 60;
unitmap['day'] = unitmap['d'] = unitmap['hour'] * 24;
unitmap['week'] = unitmap['wk'] = unitmap['w'] = unitmap['day'] * 7;
unitmap['month'] = unitmap['week'] * 4;
unitmap['year'] = unitmap['yr'] = unitmap['y'] = unitmap['day'] * 365;

const clauseExp: RegExp = /(\d+(?:\.\d+)?)\s*([a-z]+)/;

// Convert time string with units into milliseconds
// For example,
// 1 day ago
// 10 minutes ago
// 10 min ago
// 10 minutes, 50 seconds ago
// 10 min, 30 sec ago
function parseDateFilter(str: string): number {
    // split on clauses (if any)
    let clauses: string[] = str.trim().split(',');
    let total: number = 0;

    // parse each clause
    for (let i: number = 0; i < clauses.length; i++) {
        let clause: string = clauses[i].trim();
        let terms: RegExpExecArray = clauseExp.exec(clause);
        if (!terms) {
            continue;
        }
        let count: number = parseFloat(terms[1]);
        let unit: string = terms[2].replace(/s$/, '');
        if (!unitmap.hasOwnProperty(unit)) {
            continue;
        }
        total += count * unitmap[unit];
    }
    return total;
}
const COL_FILTER_STRING: IColumnFilter = {
    isActive: function (filterValue: any): boolean {
        return !!filterValue && !!(filterValue as string).trim();
    },
    doFilter: function (term: string, value: any, row: Object): boolean {
        term = term.toLowerCase().trim();
        value = String(value).toLowerCase();
        let first: string = term[0];

        // negate
        if (first === '!') {
            term = term.substr(1);
            if (term === '') {
                return true;
            }
            return value.indexOf(term) === -1;
        }

        // strict
        if (first === '=') {
            term = term.substr(1);
            return term === value.trim();
        }

        // remove escaping backslashes
        term = term.replace('\\!', '!');
        term = term.replace('\\=', '=');

        return value.indexOf(term) !== -1;
    }
};

const COL_FILTER_NUMBER: IColumnFilter = {
    isActive: function (filterValue: any): boolean {
        return !!filterValue && !!(filterValue as string).trim();
    },
    doFilter: function (term: string, value: any, row: Object): boolean {
        let parsedValue: number = parseFloat(value);
        term = term.trim();
        let firstTwo: string = term.substr(0, 2);
        let firstChar: string = term[0];
        let against1: number = parseFloat(term.substr(1));
        //let against2: number = parseFloat(term.substr(2));
        if (firstTwo === '<=') {
            let value: string = term.substr(2);
            return value === null || value.length === 0 || parsedValue <= parseFloat(value);
        }
        if (firstTwo === '>=') {
            let value: string = term.substr(2);
            return value == null || value.length == 0 || parsedValue >= parseFloat(value);
        }
        if (firstChar === '<') {
            let value: string = term.substr(1);
            return value == null || value.length == 0 || parsedValue < parseFloat(value);
        }
        if (firstChar === '>') {
            let value: string = term.substr(1);
            return value == null || value.length == 0 || parsedValue > parseFloat(value);
        }
        if (firstChar === '~') {
            let value: string = term.substr(1);
            return value == null || value.length == 0 || Math.round(parsedValue) === against1;
        }
        if (firstChar === '=') {
            let value: string = term.substr(1);
            return value == null || value.length == 0 || parseFloat(value) === parsedValue;
        }
        return value.toString().indexOf(term.toString()) > -1;
    }
};

const COL_FILTER_DATE: IColumnFilter = {
    isActive: function (filterValue: any): boolean {
        return !!filterValue && !!(filterValue as string).trim();
    },
    doFilter: function (term: string, value: Date | number): boolean {
        // today
        // yesterday
        // 1 day ago
        // 2 days ago

        // < 1 day ago
        // < 10 minutes ago
        // < 10 min ago
        // < 10 minutes, 50 seconds ago
        // > 10 min, 30 sec ago
        // > 2 days ago
        // >= 1 day ago
        term = term.trim();
        if (!term) {
            return true;
        }
        let numValue: number = value.valueOf();
        let nowDate: Date = new Date();
        let now: number = nowDate.valueOf();
        let first_char: string = term[0];
        let other_chars: string = (term.substr(1)).trim();
        let lowerbound: number, upperbound: number;
        if (first_char === '<') {
            lowerbound = now - parseDateFilter(other_chars);
            return numValue > lowerbound;
        }
        if (first_char === '>') {
            upperbound = now - parseDateFilter(other_chars);
            return numValue < upperbound;
        }

        if (term === 'today') {
            return new Date(numValue).toDateString() === nowDate.toDateString();
        }

        if (term === 'yesterday') {
            return new Date(numValue).toDateString() === new Date(now - unitmap['d']).toDateString();
        }

        let supposedDate: Date = new Date(term);
        if (!isNaN(supposedDate.valueOf())) {
            return new Date(numValue).toDateString() === supposedDate.toDateString();
        }

        return false;
    }
};

const COL_FILTER_ENUM: IColumnFilter = {
    isActive: function (filterValue: any): boolean {
        if (!filterValue) {
            return false;
        }
        let filterValueObj: Object = filterValue as Object;
        return Object.keys(filterValueObj).some(key => {
            return !filterValueObj[key];
        });
    },
    doFilter: function (filterValue: any, value: any, row: Object): boolean {
        let filterValueObj: Object = filterValue as Object;
        return filterValueObj[value];
    }
};

// REGISTER BUILT-IN FILTERS
UiTablePlugin.registerFilter(BUILTIN_COLUMN_FILTERS.STRING, COL_FILTER_STRING);
UiTablePlugin.registerFilter(BUILTIN_COLUMN_FILTERS.NUMBER, COL_FILTER_NUMBER);
UiTablePlugin.registerFilter(BUILTIN_COLUMN_FILTERS.DATE, COL_FILTER_DATE);
UiTablePlugin.registerFilter(BUILTIN_COLUMN_FILTERS.ENUM, COL_FILTER_ENUM);