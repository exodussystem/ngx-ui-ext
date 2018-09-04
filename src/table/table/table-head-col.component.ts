import { Component, Input, ElementRef, OnInit, HostBinding, HostListener } from "@angular/core";
import { Subscription } from "rxjs/Rx";
import { UiTableResizerDirective } from './table-resizer.directive';
import { UiTableState } from '../config/table-state';
import { ITableColumn } from '../config/column-config';

@Component({
    selector: '[uiTableHeaderFooterColumn]',
    template: `{{show ? column.config.label : ''}}
        <div *ngIf="show && column.config.resizable" uiTableResizer [column]="column"></div>
    `,
    styles: [`
        /* disable selecting when hold shift */
        :host {
            position:relative;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
    `],
    providers: [UiTableResizerDirective]
})
export class UiTableHeaderFooterColumn implements OnInit {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _subscription: Subscription;

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input()
    public column: ITableColumn;

    @Input()
    public show : boolean = true;

    @HostBinding('style.width')
    public get width(): string {
        return this.column.width || 'auto';
    }

    // @HostBinding('hidden')
    // public get hidden(): boolean {
    //     return !this.column.config.visible;
    // }

    @HostBinding('class')
    public classNames: string = '';

    @HostListener('click', ['$event'])
    public handleClick(event: MouseEvent): void {
        event.preventDefault();
        if (this.column.hasSort) {
            // toggle sort
            this.state.toggleSort(this.column, event.shiftKey);
        }
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _element: ElementRef, public state: UiTableState) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit() : void {
        // subscribe to table changing observable (changes in  filtering and sorting)
        this._subscription = this.state.getStateChanged()
            .subscribe(() => this._updateTableHeaders()); // filter and sort again
        let text: string = this.column.config.title || this.column.config.label || '';
        this._element.nativeElement.setAttribute('title', text);
        if (this.column.hasSort)
            this._element.nativeElement.setAttribute('aria-label', text + ': Click to sort')
        else
            this._element.nativeElement.setAttribute('aria-label', text);

    }

    // implements OnDestroy
    ngOnDestroy(): void {
        // unsubscribe
        this._subscription.unsubscribe();
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private _updateTableHeaders(): void {
        this.classNames = this._getHeaderClassNames();
    }

    private _getHeaderClassNames(): string {
        let classNames: Array<string> = [];
        if (this.column.config.headerClass) {
            classNames.push(this.column.config.headerClass);
        }
        if (this.show && this.column.hasSort) {
            // add CSS class for sorting
            if (this.column.config.sorting &&
                this.column.config.sorting.className) {
                classNames.push(this.column.config.sorting.className);
            }
            else if (this.state.config.sortConfig &&
                     this.state.config.sortConfig.className) {
                classNames.push(this.state.config.sortConfig.className);
            }
            else {
                classNames.push('col-sort');
            }

            // add CSS class for sort icon position
            if ((this.column.config.sorting &&
                this.column.config.sorting.sortIconPos === 'left') ||
                (this.state.config.sortConfig &&
                this.state.config.sortConfig.sortIconPos === 'left')) {
                classNames.push('col-sort-left');
            }
            else {
                // otherwise, default is right
                classNames.push('col-sort-right');
            }

            // add CSS class for sort type (ascending/descending)
            if (this.column.sortOrder === 'ASC') {
                classNames.push(this.column.config.sorting.ascClassName || 'col-sort-asc');
            }
            else if (this.column.sortOrder === 'DESC') {
                classNames.push(this.column.config.sorting.descClassName || 'col-sort-desc');
            }
            else {
                classNames.push(this.column.config.sorting.defaultClassName || 'col-sort-default');
            }
        }
        return classNames.join(' ');
    }
}