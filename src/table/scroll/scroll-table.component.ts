/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/23/2017.
 */

import { Component, ElementRef, ViewEncapsulation } from "@angular/core";
import { UiTableState } from "../config/table-state";
import { UiTableComponent } from "../table/table.component";
import { ITablePagingState } from '../paging/table-paging';

@Component({
    selector: 'ui-table-scroll',
    template: `
    <div class="table-info-wrapper row margin-bottom-10">
        <div role="status" class="pull-left col-md-8 padding-top-10">
            <div *ngIf="paging && visibleRows?.length > 0">
                Showing {{paging.start}} to {{paging.end}} of {{paging.totalItems}} {{paging.totalItems > 1 ? state.config.pluralRecordText : state.config.singularRecordText}}
            </div>
            <div *ngIf="!paging || visibleRows?.length === 0">
                Showing {{rows?.length}} {{rows?.length > 1 ? state.config.pluralRecordText : state.config.singularRecordText}}
            </div>
        </div>
        <div *ngIf="state.config.filtering==='table'" class="pull-right col-md-4" 
            uiTableTextFilter [filter]="state.config.filterConfig"></div>
    </div>
    
    <div class="table-header-wrapper" [ngClass]="{'collapse-bottom' : state.config.filtering==='table' || !state.hasAnyFilters}">
        <table *ngIf="state.config.header" role="grid" class="table header-component" ngClass="{{state.config.className}}">
        <thead>
            <!-- column headers -->
            <tr role="row" uiTableHeaderFooterRow></tr>
            <!-- column filters -->          
            <tr role="row" *ngIf="state.config.filtering==='column' && state.hasAnyFilters" uiTableFilterRow></tr>
        </thead>
        </table>
    </div>
    <!-- scrolling body -->
    <uiTableScrollBody *ngIf="isLoaded" [style.height]="bodyHeight + 'px'"
                        [rows]="filteredSortedRows" [bodyHeight]="bodyHeight" (pageChange)="onPageChange($event)"></uiTableScrollBody>
                        
    <div class="table-footer-wrapper">
        <table role="grid" *ngIf="state.config.footer" class="table footer-component" ngClass="{{state.config.className}}">
        <tfoot>
            <!-- column footers -->
            <tr role="row"  uiTableHeaderFooterRow></tr>
        </tfoot>
        </table>
    </div>
    
    <div class="loading-message" *ngIf="!isLoaded && !hasError">Loading...</div>
    
    <div *ngIf="hasError">An error occurred.</div>
    `,
    styles: [`
        :host {
            position: relative;
            display: block;
        }
        .table-header-wrapper, 
        .table-footer-wrapper {
            display: block;
            overflow-y: scroll;
            overflow-x: hidden;
            
        }
        .collapse-bottom {
            margin-bottom: -12px !important;
        }
        .header-component {
            border-bottom: none;
        }
        .footer-component {
            border-top: none;
        }
        .table {
            table-layout: fixed;
            width: 100%;
            margin-bottom: 0;
            overflow-y: scroll;
        }
        .loading-message {
            text-align: center;
        }
    `],
    encapsulation: ViewEncapsulation.None,
    providers: [UiTableState]
    // new state instance for each table component
})
export class UiScrollTableComponent extends UiTableComponent {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private bodyHeight: number;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _element: ElementRef, state: UiTableState) {
        super(state);
    }

    // -------------------------------------------------------------------------
    // Lifecycle listeners
    // -------------------------------------------------------------------------

    // implements AfterContentInit
    ngAfterContentInit(): void {
        super.ngAfterContentInit();

        setTimeout(() => {
            if (!this.state.config.height) {
                let parentHeight: number =
                    this._element.nativeElement.parentElement.clientHeight;
                this._setTableHeight(parentHeight);
            }
            else {
                this._setTableHeight(this.state.config.height);
            }
        });
    }

    public onPageChange(paging: ITablePagingState) {
        this.paging = paging;
    }

    private _setTableHeight(totalHeight: number): void {

        let headerTableElement: HTMLElement =
            this._element.nativeElement.querySelector('.table-header-wrapper');

        let footerTableElement: HTMLElement =
            this._element.nativeElement.querySelector('.table-footer-wrapper');

        let tableInfoElement: HTMLElement =
            this._element.nativeElement.querySelector('.table-info-wrapper');

        let height: number = 0;
        // calculate table header height
        if (headerTableElement) {

            height += headerTableElement.offsetHeight;
        }

        // calculate table footer height
        if (footerTableElement) {

            height += footerTableElement.offsetHeight;
        }

        // calculate table info height
        if (tableInfoElement) {

            height += tableInfoElement.offsetHeight;
        }

        // subtract it from totalHeight, set bodyHeight to result
        this.bodyHeight = totalHeight - height;
    }
}