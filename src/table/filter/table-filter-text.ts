import { Component, Input } from "@angular/core";
import { ITableFilterConfig } from "./table-filters";
import { UiTableState } from "../config/table-state";
import { Subject } from 'rxjs/Rx';

@Component({
    selector: '[uiTableTextFilter]',
    template: `
<!--    <div [ngClass]="filter.enableIcon?'input-group':'btn-group'" attr.id="{{state.config.tableId + '-filter'}}">
	    <span *ngIf="filter.enableIcon" 
	            aria-label="Search by keyword.Use prefix '!' to exclude.Use prefix '=' to match exact keyword."
	            title="Search by keyword.\nUse prefix '!' to exclude.\nUse prefix '=' to match exact keyword."
	            class="input-group-addon {{filter.inputClass}}">
	            <i class="{{filter.iconClass}}"></i>
        </span>
        <input type="search" 
            placeholder="{{filter.placeholder}}"
            title="{{filter.title}}"
            class="form-control {{filter.inputClass}}"
            [ngClass]="{ hasContent: !!filter.filterValue }"
            [(ngModel)]="filter.filterValue"
            (ngModelChange)="onModelChange($event)"/>
        <span *ngIf="filter.filterValue" uiIcon [name]="'remove'" class="btn-clear" (click)="clearFilter($event)"></span>
    </div>-->
    <div class="form-inline">
	    <label [class.sr-only]="embedded" class="no-margin" 
               attr.for="{{embedded ? (state.config.tableId + '-filter-' + filter.key):(state.config.tableId + '-filter')}}">
            Search: 
        </label>
        <input type="search" [class.embedded]="embedded"
               placeholder="{{filter.placeholder}}"
               class="form-control {{filter.inputClass}}"
               attr.id="{{embedded ? (state.config.tableId + '-filter-' + filter.key):(state.config.tableId + '-filter')}}"
               [ngClass]="{ hasContent: !!filter.filterValue }"
               [(ngModel)]="filter.filterValue"
               (ngModelChange)="onModelChange($event)"/>
        <span *ngIf="filter.filterValue" uiIcon [name]="'remove'" class="btn-clear" (click)="clearFilter($event)"></span>
    </div>
    `,
    styles: [`
        :host {
            position: relative;
        }

        input {
            width: 100%;
            margin-left: 10px;
        }

        .hasContent {
            background: #d9edf7;
        }

        .embedded {
            width: 95%;
            width: calc(100% - 8px);
            margin: 0;
        }

        .btn-clear {
            position: absolute;
            z-index: 10;
            right: 15px;
            top: 0;
            bottom: 0;
            height: 14px;
            margin: auto;
            font-size: 13px;
            cursor: pointer;
            color: #ccc;
        }

        .btn-clear:hover {
            color: #843534;
        }

        /* hide the reset button when input is readonly or disabled */
        :host >>> input[disabled] ~ .btn-clear,
        :host >>> input[readonly] ~ .btn-clear {
            display: none !important;
        }

        .input-group > span {
            cursor: help !important;
        }
    `]
})
export class UiTableTextFilter {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _modelChanged: Subject<string> = new Subject<string>();

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input() filter: ITableFilterConfig;

    @Input() embedded: boolean = false;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(public state: UiTableState) {
        this._modelChanged
            .debounceTime(300)      // wait 300ms after the last event before emitting last event
            .distinctUntilChanged() // only emit if value is different from previous value
            .subscribe(filterValue => this.state.notify());
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    onModelChange(filterValue: string): void {
        this._modelChanged.next(filterValue);
    }

    clearFilter(): void {
        this.filter.filterValue = '';
        this.state.notify();
    }
}