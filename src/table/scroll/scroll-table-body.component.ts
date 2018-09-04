/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/23/2017.
 */

import {
    Component, OnChanges, OnInit, OnDestroy, Input, ElementRef, SimpleChanges, HostListener,
    Output, EventEmitter
} from "@angular/core";
import { UiTableState } from "../config/table-state";
import { ITablePagingState } from '../paging/table-paging';
import { Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/observable/fromEvent';

const DEFAULT_ROW_HEIGHT: number = 20;
const PADDING_ROW_COUNT: number = 20;
const TABLE_DEBOUNCE_DELAY: number = 250;

@Component({
    selector: 'uiTableScrollBody',  // a tag
    template: `
    <table class="table" ngClass="{{state.config.className}}">
      <thead class="sizing-thead">
        <tr>
            <ng-container *ngFor="let column of state.columns">
            <th *ngIf="column.config.visible !== false"
                ngClass="{{column.config.headerClass || ''}}"  
                uiTableHeaderFooterColumn [column]="column" [show]="false"></th>
            </ng-container>
        </tr>
      </thead>
      <tbody *ngIf="visibleRows?.length > 0" class="scrolling-rows"
            uiTableScrollRow
            [columnCount]="state.totalColumns"
            [rowHeight]="rowHeight"
            [rowCount]="rowOffset">
      </tbody>
      <tbody class="visible-rows">
        <tr *ngFor="let row of visibleRows" uiTableRow [row]="row"></tr>
        <tr *ngIf="visibleRows?.length == 0">
            <td [attr.colspan]="state.totalColumns" [style.height]="bodyHeight + 'px'">
                {{state.config.noMatchText}}
            </td>
        </tr>
      </tbody>
      <tbody *ngIf="visibleRows?.length > 0" class="scrolling-rows"
            uiTableScrollRow
            [columnCount]="state.totalColumns"
            [rowHeight]="rowHeight"
            [rowCount]="rows.length - rowOffset - visibleRows.length - 1">
      </tbody>
    </table>
  `,
    styles: [`
    :host {
        display: block;
        overflow: auto;
    }
    thead.sizing-thead th {
        padding: 0 !important;
        border-width: 0;
    }
    table {
        table-layout: fixed;
        width: 100%;
        margin-bottom: 0;
    }
    
    tbody.scrolling-rows, 
    tbody.visible-rows {
        border-top: none;
    }
    
    tbody.visible-rows >>> td {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
  `]
})
export class UiScrollTableBodyComponent implements OnChanges, OnInit, OnDestroy {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------
    private _subscriptions: Subscription[] = [];

    visibleRows: Array<any> = [];

    // assume small row height at first.
    // The real height will be detected once rows are rendered.
    rowHeight: number = DEFAULT_ROW_HEIGHT;

    rowOffset: number = 0;

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input() rows: Array<any>;
    @Input() bodyHeight: number;
    @Output() pageChange: EventEmitter<ITablePagingState> =
                                new EventEmitter<ITablePagingState>();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _element: ElementRef, public state: UiTableState) {}

    // -------------------------------------------------------------------------
    // Lifecycle listeners
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit(): void {
        const targetElement = this._element.nativeElement || window;

        this._subscriptions.push(Observable
            .fromEvent(targetElement, 'scroll')
            .debounceTime(TABLE_DEBOUNCE_DELAY)
            .subscribe((event) => {
                this._updateTableRows();
            })
        );
        this._subscriptions.push(Observable
            .fromEvent(targetElement, 'resize')
            .throttleTime(TABLE_DEBOUNCE_DELAY)
            .subscribe((event) => {
                this._updateTableRows();
            })
        );
    }

    // implements OnDestroy
    ngOnDestroy(): void {
        // unsubscribe
        this._subscriptions.forEach(sub => sub.unsubscribe());
        this._subscriptions.length = 0;
    }

    // implements OnChanges
    ngOnChanges(changes: SimpleChanges): void {
        setTimeout(() => {
            this._updateTableRows();
        });
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private _updateTableRows() {
        this._detectRowHeight();
        this._updateVisibleRows();
    }

    private _updateVisibleRows(): void {
        let currentScroll: number = this._element.nativeElement.scrollTop;

        let start: number = Math.round(currentScroll / this.rowHeight);
        let end: number = Math.ceil((currentScroll + this.bodyHeight) / this.rowHeight);

        let startIndex: number = Math.max(0, start - PADDING_ROW_COUNT);
        let endIndex: number = Math.min(this.rows.length - 1, end + PADDING_ROW_COUNT);

        this.rowOffset = startIndex;
        this.visibleRows = this.rows.slice(startIndex, endIndex);

        this._updatePageInfo(start, end, this.rows.length);
    }

    private _updatePageInfo(start: number, end: number, total: number) {

        let paging: ITablePagingState = {
            maxSize: 0,
            itemsPerPage: 0,
            numPages: 1,
            page: 1,
            totalItems: total,
            start: Math.max(1, start + 1),
            end: Math.min(end, total)
        };
        this.pageChange.emit(paging);
    }

    private _detectRowHeight(): void {
        let tr: HTMLTableSectionElement =
            this._element.nativeElement.querySelector('tbody.visible-rows tr');
        if (tr != null) {
            this.rowHeight = tr.offsetHeight;
        }
    }
}
