/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/4/2017.
 */

import { SORT_ORDER } from '../sort/table-sorters';
import { IColumnSortConfig, IColumnSorter } from '../sort/column-sorter';
import { IColumnFilterConfig, IColumnFilter } from '../filter/column-filter';
import { PipeTransform } from '@angular/core/core';

// configuration of table column
export interface ITableColumnConfig {
    id?: string;                        // id of a column
    key: string;                        // row attribute/key to retrieve column data
    label: string;                      // column label
    title?: string;                     // tooltip text to display when hover over column
    headerClass?: string;               // additional CSS classes added to header column
    rowClass?: string;                  // additional CSS classes added to row column
    width?: number|string;              // width of the column, etc: 100px, 10%.... Default is 'auto'
    visible?: boolean;                  // show/hide this column
    resizable?: boolean;                // enable/disable column resizing
    rowScope?: boolean;                 // indicate that scope of this column will set to 'row' (scope="row")
    sorting?: IColumnSortConfig;        // sorting configuration for this column
    filtering?: IColumnFilterConfig;    // filtering configuration for this column
    formatter?: ITableCellFormatter;    // used to customize display value of this column
    transformers?: ITableCellTransformer[];// transformers that will be chained
    component?: any;                    // embedded component to render for this column.
                                        // This Component class must extend UiTableCellBaseComponent class
}

// cell data formatter
// Note - used to provide different view of data
// for example, use to show a check instead of YES/NO
// the function should return a HTML string
export type ITableCellFormatter =
    (value: any, row: Object, column: ITableColumn)=> string;

export interface ITableCellTransformer {
    // return args to perform transformation
    args?: (value: any, row: Object, column: ITableColumn)=> any[];

    // transformer pipe instance (CurrencyPipe, NumberPipe...)
    pipe: PipeTransform;
}

export const BOOLEAN_TO_YN_FORMATTER : ITableCellFormatter =
    function (value: any, row: Object, column: ITableColumn) {
        if (value===true)
            return 'Y';
        return 'N';
    };

// store the current status of table column
export interface ITableColumn {
    config: ITableColumnConfig;         // store the configuration of this column
    id?: string;                        // column id (TODO: remove)
    sortOrder?: SORT_ORDER;             // column current sort order 'DESC'|'ASC'|null
    sorter?: IColumnSorter;             // sort method
    filter?: IColumnFilter;             // column-specific filter
    visible?: boolean;                  // show/hide this column
    width?: string;                     // current width of the column, etc: 100px, 10%....
    hasSort?: boolean;                  // true if this column sorting is enabled
    hasFilter?: boolean;                // true if this column filtering is enabled
}
