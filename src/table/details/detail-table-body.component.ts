/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 4/20/2017.
 */

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UiTableState } from '../config/table-state';
import { ITableRowConfig } from '../config/row-config';

@Component({
    selector: '[uiDetailTableBody]',
    template: `
        <tr class="master-row">
            <td *ngIf="rowConfig.controlButtonPos === 'first'">
                <a href [ngClass]="showDetails ? rowConfig.collapseButtonClass : rowConfig.expandButtonClass"
                        [attr.title]="showDetails ? rowConfig.collapseTitle : rowConfig.expandTitle"
                        [attr.aria-label]="showDetails ? rowConfig.collapseTitle : rowConfig.expandTitle" 
                        (click)="toggleDetailRow($event);">
                    <i [ngClass]="showDetails ? rowConfig.collapseIconClass : rowConfig.expandIconClass"></i>
                </a>
			</td>
            <ng-container *ngFor="let column of state.columns">
            <td *ngIf="column.config.visible !== false"
                [attr.scope]="column.config.rowScope ? 'row':''"
                ngClass="{{column.config.rowClass||''}}"
                uiTableCell [row]="row" [column]="column">
            </td>
            </ng-container>
            <td *ngIf="rowConfig.controlButtonPos === 'last'" >
                <a href [ngClass]="showDetails ? rowConfig.collapseButtonClass : rowConfig.expandButtonClass"
                        [attr.title]="showDetails ? rowConfig.collapseTitle : rowConfig.expandTitle"
                        [attr.aria-label]="showDetails ? rowConfig.collapseTitle : rowConfig.expandTitle" 
                        (click)="toggleDetailRow($event);">
                    <i [ngClass]="showDetails ? rowConfig.collapseIconClass : rowConfig.expandIconClass"></i>
                </a>
			</td>
        </tr>
        <tr class="details-row">
            <td [attr.colspan]="state.totalColumns + 1" uiDetailTableCell 
                [row]="row" [visible]="showDetails" (onToggle)="onCellToggle($event)"></td>
       </tr>
    `,
    styles: [`
    tr.master-row {
        background-color: #f0f0f0;
    }
    tr.details-row > td {
        padding: 0 !important;
        margin: 0 !important;
        border-top: hidden 0px !important;
    }
    `],
})
export class UiDetailTableBodyComponent {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    public rowConfig: ITableRowConfig;
    public showDetails: boolean = false;

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input()
    row: any;

    @Input()
    set show(showDetails: boolean) {
        this.showDetails = showDetails;
    }

    @Output()
    onRowToggle: EventEmitter<boolean> = new EventEmitter();

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

    toggleDetailRow($event) {
        $event.preventDefault();
        $event.stopPropagation();
        this.showDetails = !this.showDetails;
    }

    onCellToggle($event) {
        // propagate the event from table cell to table row
        this.onRowToggle.emit($event);
    }
}