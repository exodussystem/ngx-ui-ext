/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 7/18/2017.
 */

import { ITableSortConfig, SORT_ORDER } from './table-sorters';
import { UiTablePlugin } from '../config/table-plugin';

export interface IColumnSortConfig extends ITableSortConfig {
    sortOrder?: SORT_ORDER;     // initial sort order
    sortType?: any;             // sort type (used to look up UiTablePlugin)
}

export type IColumnSorter = (val1: any, val2: any, col1?: Object, col2?: Object)=> number;

export const BUILTIN_COLUMN_SORTERS = {
    STRING: 'string',
    NUMBER: 'number',
    DATE: 'date',
    DATE_DDMMYYYY: {type: 'date_string', format: 'DDMMYYYY'},   // either DD/MM/YYYY or DD-MM-YYYY
    DATE_MMDDYYYY: {type: 'date_string', format: 'MMDDYYYY'}    // either MM/DD/YYYY or MM-DD-YYYY
}

//
// BUILT-IN SORTERS
//

//compare 2 string objects
const COL_SORTER_STRING: IColumnSorter = (val1: any, val2: any, col1?: Object, col2?: Object): number => {
    return val1.localeCompare(val2);
};

// compare 2 numbers
const COL_SORTER_NUMBER: IColumnSorter = (val1: any, val2: any, col1?: Object, col2?: Object): number => {
    return val1 - val2;
};

// compare 2 date objects
const COL_SORTER_DATE: IColumnSorter = (val1: any, val2: any, col1?: Object, col2?: Object): number => {
    if (val1.constructor !== Date || val2.constructor !== Date) {
        throw "invalid_date";
    }

    return (isFinite(val1.valueOf()) && isFinite(val2.valueOf())) ?
    +(val1 > val2) - +(val1 < val2) : NaN;
};

const dateRE = /^(\d{2})[\/\- ](\d{2})[\/\- ](\d{4})/;

const COL_SORTER_DATE_DDMMYYYY: IColumnSorter = (val1: any, val2: any, col1?: Object, col2?: Object): number => {
    // works with DD/MM/YYY or DD-MM-YYYY
    let a = val1.split(/[\/-]/).reverse().join('');
    let b = val2.split(/[\/-]/).reverse().join('');

    //let a = val1.replace(dateRE,"$3$2$1");
    //let b = val2.replace(dateRE,"$3$2$1");
    return a > b ? 1 : a < b ? -1 : 0;
};

const COL_SORTER_DATE_MMDDYYYY: IColumnSorter = (val1: any, val2: any, col1?: Object, col2?: Object): number => {
    // works with MM/DD/YYY or MM-DD-YYYY
    let a = val1.replace(dateRE, "$3$1$2");
    let b = val2.replace(dateRE, "$3$1$2");
    return a > b ? 1 : a < b ? -1 : 0;
}

// REGISTER BUILT-IN SORTERS
UiTablePlugin.registerSorter(BUILTIN_COLUMN_SORTERS.STRING, COL_SORTER_STRING);
UiTablePlugin.registerSorter(BUILTIN_COLUMN_SORTERS.NUMBER, COL_SORTER_NUMBER);
UiTablePlugin.registerSorter(BUILTIN_COLUMN_SORTERS.DATE, COL_SORTER_DATE);
UiTablePlugin.registerSorter(BUILTIN_COLUMN_SORTERS.DATE_DDMMYYYY, COL_SORTER_DATE_DDMMYYYY);
UiTablePlugin.registerSorter(BUILTIN_COLUMN_SORTERS.DATE_MMDDYYYY, COL_SORTER_DATE_MMDDYYYY);