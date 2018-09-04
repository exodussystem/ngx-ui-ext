/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/13/2017.
 */

import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs/Rx";
import { SORT_ORDER, SORT_CYCLES, DEFAULT_TABLE_SORT_CONFIG } from "../sort/table-sorters";
import { BUILTIN_COLUMN_SORTERS } from "../sort/column-sorter";
import { ITableConfig } from './table-config';
import { ITableColumnConfig, ITableColumn } from './column-config';
import { RandomUtils } from '../../common/utils/random-utils';
import { UiTablePlugin } from './table-plugin';
import { BUILTIN_COLUMN_FILTERS, IColumnFilter, IColumnFilterConfig } from '../filter/column-filter';

@Injectable()
export class UiTableState {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    // publicly exposed properties
    public tableId: string;
    public hasAnyFilters: boolean = false;
    public hasAnySorters: boolean = false;
    public columns: ITableColumn[] = [];
    public sortStack: string[] = [];
    public config: ITableConfig;
    public selectedRowId: string;       // id of selected row
    public totalColumns: number;

    private _stateChanged: Observable<UiTableState>;

    // source of observable
    private _stateChangedSource: BehaviorSubject<UiTableState> =
        new BehaviorSubject<UiTableState>(this);

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
    public notify(): void {

        this._stateChangedSource.next(this);
    }

    // get the state changed observable
    public getStateChanged(): Observable<UiTableState> {
        return this._stateChanged;
    }

    public findColumnById(id: string): ITableColumn {
        return this.columns.find((col: ITableColumn) => col.id === id);
    }

    public setColumns(columnConfigs: Array<ITableColumnConfig>) {
        if (!columnConfigs) {
            throw new Error('Column configurations not set.');
        }
        this.totalColumns = 0;
        columnConfigs.forEach((columnConfig: ITableColumnConfig) => {
            // generated unique ID as column ID
            if (!columnConfig.id)
                columnConfig.id = RandomUtils.getUUID();

            // if each column is not set, copy the table config
            if (columnConfig.resizable === undefined)
                columnConfig.resizable = this.config &&(this.config.resizable === true);

            let filterConfig: IColumnFilterConfig = columnConfig.filtering;
            if (filterConfig) {
                this.hasAnyFilters = true;
                filterConfig.key = filterConfig.key || columnConfig.key;
                filterConfig.columnFilterInput = filterConfig.columnFilterInput || 'text';
                filterConfig.columnFilterType = filterConfig.columnFilterType || BUILTIN_COLUMN_FILTERS.STRING;
                filterConfig.filterType = filterConfig.filterType || 'default';
                filterConfig.filterValue = '';

            }
            if (columnConfig.sorting) {
                this.hasAnySorters = true;
                // if table sorting config is set
                if (this.config.sorting) {
                    // copy all settings of table to column
                    columnConfig.sorting = Object.assign({}, this.config.sorting, columnConfig.sorting);
                }
                columnConfig.sorting.sortType = columnConfig.sorting.sortType || BUILTIN_COLUMN_SORTERS.STRING;
            }
            let column: ITableColumn = this.findColumnById(columnConfig.id);
            // this.columns.find((col: ITableColumn) => !!col.id && !!columnConfig.id && col.id === columnConfig.id);

            if (column) {
                column.config = Object.assign(column.config, columnConfig);
            }
            else {
                let _visible: boolean = (columnConfig.visible !== false);
                let _sortOrder = (!!columnConfig.sorting && !!columnConfig.sorting.sortOrder)
                    ? columnConfig.sorting.sortOrder : null;
                let _sorter = (!!columnConfig.sorting && !!columnConfig.sorting.sortType)
                    ? UiTablePlugin.getSorter(columnConfig.sorting.sortType) : null;
                let _filter: IColumnFilter = null;

                if (!!columnConfig.filtering) {
                    if ('table' === this.config.filtering
                        && 'default' !== columnConfig.filtering.filterType) {
                        _filter = UiTablePlugin.getFilter(columnConfig.filtering.filterType);
                    }
                    else if ('column' === this.config.filtering) {
                        _filter = UiTablePlugin.getFilter(columnConfig.filtering.columnFilterType)
                    }
                }
                let _width: string =
                    (!columnConfig.width)    // if not specified
                        ? 'auto'            // then use auto width
                        : ((typeof columnConfig.width === 'number')
                        ? columnConfig.width + 'px'  // if number, convert to pixel
                        : columnConfig.width + '');  // otherwise, use specified value (could be %)

                column = {
                    id: columnConfig.id,
                    config: columnConfig,
                    sortOrder: _sortOrder,
                    sorter: _sorter,
                    filter: _filter,
                    visible: _visible,
                    width: _width,
                    hasSort: (!!columnConfig.sorting ? true : false),
                    hasFilter: (!!columnConfig.filtering ? true : false)
                };
                this.columns.push(column);
                this.totalColumns += (_visible === true) ? 1:0;
                // if initial sort was set, add to sort stack
                if (!!column.sortOrder) {
                    this.sortStack.push(column.id);
                }
            }
        });

    }

    // stackingSort - when user holds SHIFT, the sort keeps stacking up
    // support multiple columns sorting
    public toggleSort(sortColumn: ITableColumn, stackingSort: boolean = false): void {
        let columnId: string = sortColumn.id;

        // Set next sort order
        sortColumn.sortOrder = UiTableState.getNextSortOrder(sortColumn.sortOrder);

        // Check if we are clearing the rest of the sort stack or not
        if (stackingSort) {
            let curIndex: number = this.sortStack.indexOf(columnId);

            if (curIndex === -1) {

                this.sortStack.push(columnId);
            }
            else if (!sortColumn.sortOrder) {

                this.sortStack.splice(curIndex, 1);
            }
        }
        else {

            this.sortStack = !!sortColumn.sortOrder ? [columnId] : [];
            // reset sorting of other columns
            this.columns.forEach((column) => {
                if (column.id !== columnId) {
                    column.sortOrder = null;
                }
            });
        }
        // notify the change
        this.notify();
    }

    public static getNextSortOrder(currentSortOrder: SORT_ORDER): SORT_ORDER {
        let nextIndex: number = (SORT_CYCLES.indexOf(currentSortOrder) + 1) % SORT_CYCLES.length;
        return SORT_CYCLES[nextIndex];
    }
}
