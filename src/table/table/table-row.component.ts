import { Component, Input, HostListener, HostBinding, OnInit, ElementRef } from "@angular/core";
import { UiTableState } from "../config/table-state";
import { RandomUtils } from "../../common/utils/random-utils";

@Component({
    selector: '[uiTableRow]',
    template: `
        <ng-container *ngFor="let column of state.columns">
        <td *ngIf="column.config.visible !== false"
            ngClass="{{column.config.rowClass||''}}"
            [attr.scope]="column.config.rowScope ? 'row':''"
            uiTableCell [row]="row" [column]="column">
        </td>
        </ng-container>
    `
})
export class UiTableRow implements OnInit {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _rowId: string;

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input()
    public row: any;

    @HostBinding('class')
    get className() {
        return (this.state.selectedRowId === this._rowId)
            ? this.state.config.rowConfig.selectedClass || 'active'
            : '';
    }

    @HostListener('click', ['$event'])
    public onRowClick($event) {
        // if disable row selecting, return
        if (!this.state.config.rowConfig ||
            !this.state.config.rowConfig.enableSelect)
            return;

        if (this.state.selectedRowId != this._rowId) {
            this.state.selectedRowId = this._rowId;
        }
        else if (this.state.config.rowConfig.toggleSelection) {
            // toggle selection
            this.state.selectedRowId = null;
        }
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private element: ElementRef, public state: UiTableState) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle listeners
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit () : void {
        if (!this.state.config.rowConfig)
            return;
        if (this.state.config.rowConfig.rowIdKey) {
            this._rowId = this.row[this.state.config.rowConfig.rowIdKey];
        }
        else if (this.state.config.rowConfig.rowIdGenerator) {
            this._rowId = this.state.config.rowConfig.rowIdGenerator(this.row);
        }
        if (!this._rowId) {
            this._rowId = RandomUtils.getUUID();
        }
        this.element.nativeElement.setAttribute('id', this._rowId);
    }

}