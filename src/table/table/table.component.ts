import {
    AfterContentInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output,
    SimpleChanges, ViewEncapsulation
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { ITableColumn, ITableColumnConfig } from '../config/column-config';
import { ITablePagingConfig, ITablePagingState } from '../paging/table-paging';
import { UiTableState } from '../config/table-state';
import { ITableConfig } from '../config/table-config';
import { RandomUtils } from '../../common/utils/random-utils';
import { IColumnFilterConfig } from '../filter/column-filter';
import { CharUtils } from '../../common/utils/char-utils';
import { PropertyUtils } from '../../common/utils/prop-utils';
import { UiTableUtils } from './table-utils';

@Component({
    selector: 'ui-table',
    template: `
    <div *ngIf="state.config.info || state.config.filtering==='table'" class="row margin-bottom-10">
        <div *ngIf="state.config.info && visibleRows?.length > 0" role="status" class="pull-left col-md-8 padding-top-10">
            <div *ngIf="!!state.config.paging" attr.id="{{state.config.tableId + '-info'}}">
                Showing {{paging. start}} to {{paging.end}} of {{paging.totalItems}} {{paging.totalItems > 1 ? state.config.pluralRecordText : state.config.singularRecordText}}
            </div>
            <div *ngIf="!state.config.paging" attr.id="{{state.config.tableId + '-info'}}">
                Showing {{visibleRows.length }} {{visibleRows.length > 1 ? state.config.pluralRecordText : state.config.singularRecordText}}
            </div>
        </div>
        <div *ngIf="state.config.filtering==='table'" class="pull-right col-md-4 text-right" 
             uiTableTextFilter [filter]="state.config.filterConfig">
        </div>
    </div>
    
    <table role="grid" class="table" ngClass="{{state.config.className}}" style="width: 100%;" 
            [stickyBody]="state.config.stickyHeader" [stickyTop]="state.config.stickyTop">
    <thead *ngIf="state.config.header"> 
        <tr role="row" uiTableHeaderFooterRow (headerEvent)="onHeaderChange($event)"></tr>
        <tr role="row" uiTableHeaderFooterRow (headerEvent)="onHeaderChange($event)" 
            *ngIf="state.config.stickyHeader" 
            [stickyEvents]="(state.hasAnySorters ? 'mouseup,' : '')+(state.config.resizable ? 'mousedrag' : '')"
            [stickyElement]="state.config.stickyHeader" [stickyCloned]="'true'" ></tr>
    </thead> 
    
    <ng-container *ngIf="!state.config.details">
        <tbody uiTableBody [rows]="visibleRows"></tbody>
    </ng-container>
    
    <ng-container *ngIf="!!state.config.details">
        <tbody *ngFor="let row of visibleRows" uiDetailTableBody [row]="row" [show]="showAllDetails" (onRowToggle)="_onRowToggle($event)"></tbody>
    </ng-container>
    
    <tfoot *ngIf="state.config.footer">
        <tr role="row" uiTableHeaderFooterRow (headerEvent)="onHeaderChange($event)"></tr>
    </tfoot>
    </table>
    
    <div class="row" *ngIf="state.config.paging && visibleRows?.length>0">
        <div class="col-md-6">
            <div class="form-inline page-size-select">
                <label for="numberPerPage{{tableId}}">Show </label>
                <select id="numberPerPage{{tableId}}" class="form-control input-sm"
                    [(ngModel)]="paging.itemsPerPage" 
                    (change)="onPageSizeChange($event.target.value)">
                    <option *ngFor="let option of paging.itemsPerPageOptions" value="{{option}}" >{{option}}</option>
                </select>
                <label> {{state.config.pluralRecordText}}</label>
            </div>
        </div>
        <div class="col-md-6 pull-right text-right">
            <ui-pagination class="pagination-sm no-margin"
                        [totalItems]="paging.totalItems"
                        [itemsPerPage]="paging.itemsPerPage"
                        [maxSize]="paging.maxSize"
                        [boundaryLinks]="paging.boundaryLinks"
                        [directionLinks]="paging.directionLinks"
                        [rotate]="paging.rotate"
                        [previousText]="paging.previousText" 
                        [nextText]="paging.nextText" 
                        [firstText]="paging.firstText" 
                        [lastText]="paging.lastText"
                        [pageBtnClass]="paging.pageBtnClass"
                        [(ngModel)]="paging.page"
                        (pageChanged)="onPageChange($event)"
                        (numPages)="paging.numPages = $event">
            </ui-pagination>
        </div>
    </div>
    
    <div class="loading-message" *ngIf="!isLoaded && !hasError">
      Loading...
    </div>

    <div *ngIf="hasError">An error occurred.</div>
    `,
    encapsulation: ViewEncapsulation.None,
    providers: [UiTableState]
    // new state instance for each table component
})
export class UiTableComponent implements AfterContentInit, OnChanges, OnDestroy, OnInit {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    tableId: string;
    isLoaded: boolean = false;
    isReady: boolean = false;
    hasError: boolean = false;
    showAllDetails: boolean = false;
    filteredSortedRows: Array<any>;
    visibleRows: Array<any>;
    subscription: Subscription;
    paging: ITablePagingState;
    stickyEvents: string = '';
    totalOpeningRows: number = 0;

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input()
    public rows: Array<any> = [];

    @Input()
    public columns: Array<ITableColumnConfig>;

    @Input()
    public set pagination(pagingConfig: ITablePagingConfig) {
        // initialize pagination state
        if (pagingConfig) {
            this.paging = Object.assign(
                {},
                pagingConfig,
                {
                    totalItems: this.filteredSortedRows ? this.filteredSortedRows.length : 0,
                    numPages: 1,
                    page: 1,
                    start: 0,
                    end: 0
                }
            );
        }
    }

    @Input()
    public set config(tableConfig: ITableConfig) {
        let config: ITableConfig = Object.assign(this.state.config || {}, tableConfig || {});
        if (!!config.pagingConfig && !this.paging) {
            this.pagination = config.pagingConfig;
        }
        if (!config.tableId){
            config.tableId = 'ui-table-' + RandomUtils.getRandomString(8);
        }
        if (config.details) {
            if (!config.rowConfig || config.rowConfig.showAllDetails !== false)
                this.showAllDetails = true;
        }

        this.state.config = config;
    }

    @Output()
    public onTableReady: EventEmitter<boolean> = new EventEmitter();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(public state: UiTableState) {
        // generate unique ID as table ID
        this.tableId = '_table_' + RandomUtils.getUUID();
        // save to table state so other components can access
        state.tableId = this.tableId;
    }

    // -------------------------------------------------------------------------
    // Lifecycle listeners
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit(): void {
        // subscribe to table changing observable (changes in  filtering and sorting)
        this.subscription = this.state.getStateChanged()
            .subscribe(() => {
                this._updateTableData()
            }); // filter and sort again

        if (this.state.config.paging && this.paging) {
            this.paging.totalItems = this.filteredSortedRows ? this.filteredSortedRows.length : 0;
        }
    }

    // implements AfterContentInit
    ngAfterContentInit(): void {
        this.isLoaded = true;
    }

    // implements OnDestroy
    ngOnDestroy(): void {
        // unsubscribe
        this.subscription.unsubscribe();
    }

    // implements OnChanges
    ngOnChanges(changes: SimpleChanges): void {
        // Inform state of columns changes
        if (changes && changes['columns'] && changes['columns'].isFirstChange()) {
            this.state.setColumns(changes['columns'].currentValue);
        }
        // if changing the data/rows, reset the filter value
        if (changes && changes['rows'] && !changes['rows'].isFirstChange()) {

            this.isReady = false;
            this.onTableReady.emit(this.isReady);

            this.totalOpeningRows = 0;
            if (this.state.config.filterConfig
                && this.state.config.filterConfig.filterValue) {
                this.state.config.filterConfig.filterValue = '';
            }
        }
        this._updateTableData();
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    public onPageSizeChange(newSize: string): void {
        // TODO: whenever we set the page, conflicts from pagination. Should find solution to
        // this issue
        //this.paging.page = 1;

        this.paging.itemsPerPage = Number(newSize);
        this.onPageChange(this.paging);
    }

    public onPageChange(page: any): void {
        if (this.state.config.paging && this.paging && page) {
            this.visibleRows = this._getVisibleRows(page, this.filteredSortedRows);
        }
    }

    public onHeaderChange($event) {
        // when receiving 'Expand All'/'Collapse All' from the header button/link
        // then toggle all rows
        this.showAllDetails = ($event === 'showAllDetails');
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    protected _onRowToggle($event) {
        if ($event === true) {
            this.totalOpeningRows ++;
        }
        else {
            this.totalOpeningRows --;
            if (this.totalOpeningRows < 0)
                this.totalOpeningRows = 0;
        }

        if (this.visibleRows && this.totalOpeningRows >= this.visibleRows.length) {

            if (!this.isReady
                && (!this.state.config.rowConfig || this.state.config.rowConfig.showAllDetails !== false)) {

                // all detail rows are opened
                this.isReady = true;
                this.onTableReady.emit(this.isReady);

            }
        }
        else if (this.visibleRows && this.visibleRows.length > 0 && this.totalOpeningRows === 0) {
            // all detail rows are closed

        }
    }

    protected _calculateTotalPages(totalItems, itemsPerPage): number {
        let totalPages = itemsPerPage < 1
            ? 1
            : Math.ceil(totalItems / itemsPerPage);
        return Math.max(totalPages || 0, 1);
    }

    protected _getVisibleRows(page: ITablePagingState, data: Array<any>): Array<any> {
        this.paging.totalItems = data.length;
        let numPages: number = this._calculateTotalPages(data.length, page.itemsPerPage);
        let currentPage: number = page.page;

        if (currentPage > numPages)
            currentPage = numPages;

        let start: number = (currentPage - 1) * page.itemsPerPage;
        let end: number = page.itemsPerPage > -1
            ? (start + page.itemsPerPage)
            : data.length;

        this.paging.start = start + 1;
        this.paging.end = Math.min(end, data.length);

        return data.slice(start, end);
    }

    protected _updateTableData() {
        if (this.state.config.filtering === 'column') {
            this.filteredSortedRows = this._sortRows(this._filterRows(this.rows));
        }
        else if (this.state.config.filtering === 'table') {
            this.filteredSortedRows = this._sortRows(this._filterRowsByKeyword(this.rows));
        }
        else {
            this.filteredSortedRows = this._sortRows(this.rows);
        }
        // update pagination state
        if (this.state.config.paging && this.paging) {
            this.visibleRows = this._getVisibleRows(this.paging, this.filteredSortedRows);
        }
        else {
            this.visibleRows = this.filteredSortedRows;
        }
    }

    // Filtering globally
    //  - matching by text value
    //  - filtering in column with enabled filter
    protected _filterRowsByKeyword(rows: Array<any>): Array<any> {
        let filterValue : string = this.state.config.filterConfig.filterValue;
        if (!rows || rows.length === 0 || !filterValue || filterValue==="!" || filterValue==="=")
            return rows;

        let filterRows: Array<any> = [];
        let negateSearch: boolean = filterValue.startsWith('!');
        let filterRegex: RegExp = this._getFilterRegex(filterValue);

        rows.forEach((row: any) => {
            let matching: boolean = false;
            let useRegex: boolean = false;
            this.state.columns.some((column: ITableColumn) => {
                let filterConfig: IColumnFilterConfig = column.config.filtering;
                if (!filterConfig || !column.hasFilter)
                    return false;       // continue

                let key: any = filterConfig.key || column.config.key;
                let value: any = PropertyUtils.getValueFromObject(row, key);
                if (value && filterConfig.filterDisplayText) {
                    value = UiTableUtils.getCellDisplayValue(value, row, column);
                }
                if (!value)
                    return false;       // continue

                if (column.filter) {
                    if (column.filter.isActive(filterValue)
                        && column.filter.doFilter(filterValue, value, row)) {
                        matching = true;// found matched value
                        return true;    // break the loop
                    }
                }
                else if (filterRegex.test(value.toString())) {
                    matching = true;    // found matched value
                    useRegex = true;
                    return true;        // break the loop
                }
                return false;           // continue
            });
            // the result logic should be :
            // - if negate search is true (negateSearch: true),
            //   the row is accepted when keyword is not found (matching: false)
            // - if negate search is false (negateSearch: false),
            //   the row is accepted when the keyword is found (matching: true)
            // In other words, in order to accept the row, matching and negate should have opposed value
            if (useRegex && matching === !negateSearch) {
                filterRows.push(row);
            }
            else if (!useRegex && matching) {
                filterRows.push(row);
            }
        });

        return filterRows;
    }

    protected _getFilterRegex(keyword: string): RegExp {
        let term: string = keyword.trim().toLowerCase();

        // match everything except this keyword
        if (term.startsWith('!')) {
            // Use the original keyword without '!'
            return new RegExp(CharUtils.escapeRegexp(term.substr(1)), 'i');
        }
        // match exact this keyword
        else if (term.startsWith('=')) {
            return new RegExp('^' + CharUtils.escapeRegexp(term.substr(1)) + '$', 'i');
        }
        else {
            return new RegExp(CharUtils.escapeRegexp(term), 'i');
        }
    }

    // Filtering
    protected _filterRows(rows: Array<any>): Array<any> {
        if (!rows || rows.length === 0)
            return rows;

        let filterRows: Array<any> = [];

        let activeFilterColumns: ITableColumn[] = [];
        if (this.state.hasAnyFilters) {
            activeFilterColumns =
                this.state.columns.filter((c: ITableColumn) => {
                    return !!c.filter
                        && !!c.filter.isActive(
                            c.config.filtering.filterValue ||
                            c.config.filtering.filterSelection);
                });
        }
        if (activeFilterColumns.length) {
            filterRows = rows.filter((row) => {
                for (let i: number = 0; i < activeFilterColumns.length; i++) {
                    let column: ITableColumn = activeFilterColumns[i];
                    let filterConfig: IColumnFilterConfig = column.config.filtering;
                    if (!filterConfig || !column.hasFilter)
                        return false;       // continue

                    let key: any = filterConfig.key || column.config.key;
                    let value: any = PropertyUtils.getValueFromObject(row, key);
                    if (value && filterConfig.filterDisplayText) {
                        value = UiTableUtils.getCellDisplayValue(value, row, column);
                    }
                    if (!value || !column.filter || !column.filter.doFilter)
                        return false;       // continue
                    let filterResult: boolean =
                        (!filterConfig.columnFilterInput // if not set, then use 'text' as default
                        || filterConfig.columnFilterInput === 'text')
                        ? column.filter.doFilter(filterConfig.filterValue, value, row)
                        : column.filter.doFilter(filterConfig.filterSelection, value, row);
                    if (filterResult === false) {
                        return false;       // continue
                    }
                }
                return true;
            });
        } else {
            filterRows = rows.slice();
        }
        return filterRows;
    }

    // Sorting
    protected _sortRows(rows: Array<any>): Array<any> {
        if (!this.state.hasAnySorters || !rows || rows.length === 0)
            return rows;
        rows.sort((row1, row2) => {
            for (let i = 0; i < this.state.sortStack.length; i++) {
                let sortColumn: ITableColumn = this.state.findColumnById(this.state.sortStack[i]);
                let key: string = sortColumn.config.key;
                if (!sortColumn || !sortColumn.sorter)
                    continue;
                let val1 = PropertyUtils.getValueFromObject(row1, key) || '';
                let val2 = PropertyUtils.getValueFromObject(row2, key) || '';
                let compareResult: number = 0;
                compareResult =
                    sortColumn.sortOrder === 'ASC'
                    ? sortColumn.sorter(val1, val2, row1, row2)
                    : (sortColumn.sortOrder === 'DESC'
                        ? sortColumn.sorter(val2, val1, row2, row1) : 0);
                if (compareResult !== 0) {
                    return compareResult;
                }
            }
            return 0;
        });
        return rows;
    }
}