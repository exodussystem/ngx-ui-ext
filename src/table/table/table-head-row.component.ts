/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/23/2017.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UiTableState } from '../config/table-state';
import { ITableRowConfig } from '../config/row-config';

@Component({
    selector: '[uiTableHeaderFooterRow]',
    template: `
        <th tabindex="0" scope="col" *ngIf="!!state.config.details && rowConfig.controlButtonPos === 'first'">
            <a href class="{{rowConfig.expandButtonClass}} pull-left" (click)="showAll($event)" 
                    [attr.title]="rowConfig.expandAllTitle"
                    [attr.aria-label]="rowConfig.expandAllTitle">
                <i class="{{rowConfig.expandIconClass}}"></i>
            </a>
            <a href class="{{rowConfig.collapseButtonClass}} pull-right" (click)="hideAll($event)" 
                    [attr.title]="rowConfig.collapseAllTitle"
                    [attr.aria-label]="rowConfig.collapseAllTitle">
                <i class="{{rowConfig.collapseIconClass}}"></i>
            </a>                
        </th>
        <ng-container *ngFor="let column of state.columns">
        <th tabindex="0" scope="col" *ngIf="column.config.visible !== false"
            [attr.unselectable]="column.hasSort ? 'on' : 'off'"
            ngClass="{{column.config.headerClass || ''}}" 
            uiTableHeaderFooterColumn [column]="column">
        </th>
        </ng-container>
        <th tabindex="0" scope="col" *ngIf="!!state.config.details && rowConfig.controlButtonPos === 'last'">
            <a href class="{{rowConfig.expandButtonClass}} pull-left" (click)="showAll($event)" 
                    [attr.title]="rowConfig.expandAllTitle"
                    [attr.aria-label]="rowConfig.expandAllTitle">
                <i class="{{rowConfig.expandIconClass}}"></i>
            </a>
            <a href class="{{rowConfig.collapseButtonClass}} pull-right" (click)="hideAll($event)" 
                    [attr.title]="rowConfig.collapseAllTitle"
                    [attr.aria-label]="rowConfig.collapseAllTitle">
                <i class="{{rowConfig.collapseIconClass}}"></i>
            </a>               
        </th>
    `,
    // styleUrls: ['../sort/table-sort.css']
})

export class UiTableHeaderFooterRow {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    public rowConfig: ITableRowConfig;

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input()
    public visible : boolean = true;

    @Output()
    public headerEvent = new EventEmitter();
    // generic event emitter on table header
    // current emitting events
    // - showAllDetails / hideAllDetails (currently used with detail table)
    // - selectAll / deselectAll (future use with checkboxes)

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(public state: UiTableState) {
        if (state && state.config && state.config.rowConfig)
            this.rowConfig = state.config.rowConfig;
        else
            throw new Error('Row config is not setup correctly for details table.');
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    public showAll($event) {
        $event.preventDefault();
        $event.stopPropagation();
        this.headerEvent.emit('showAllDetails');
    }

    public hideAll($event) {
        $event.preventDefault();
        $event.stopPropagation();
        this.headerEvent.emit('hideAllDetails');
    }
}
