import {
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    ElementRef,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ITableColumn } from '../config/column-config';
import { PropertyUtils } from '../../common/utils/prop-utils';
import { UiTableUtils } from './table-utils';

@Component({
    selector: '[uiTableCell]',
    template: '<div *ngIf="column.config.component" #cmpContainer></div>'
})
export class UiTableCell implements OnInit, OnDestroy {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _cmpRef: ComponentRef<any>;

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input() row: Object;
    @Input() column: ITableColumn;

    // @HostBinding('class')
    // get className() {
    //     return this.column.config.rowClass || '';
    // }

    @ViewChild('cmpContainer', { read: ViewContainerRef })
    cmpContainer: ViewContainerRef;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    public constructor(private _element: ElementRef,
                       private _sanitizer: DomSanitizer,
                       private _resolver: ComponentFactoryResolver) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle listeners
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit () : void {
        if (this.column.config.component) {
            // since *ngIf is used, create component in setTimeout()
            setTimeout(()=> {
                const factory = this._resolver.resolveComponentFactory(this.column.config.component);
                this._cmpRef = this.cmpContainer.createComponent(factory);
                const instance: any = this._cmpRef.instance;
                instance['row'] = this.row;
                instance['column'] = this.column;
                instance['key'] = this.column.config.key;
                instance['value'] = PropertyUtils.getValueFromObject(this.row, this.column.config.key);
            }, 1);
        }
        else  {
            this._element.nativeElement.innerHTML = this.getCellDisplayValue();
        }
    }

    // implements OnDestroy
    ngOnDestroy () : void {
        // cleanup - destroy previously created component
        if (this._cmpRef)
            this._cmpRef.destroy();
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    public getCellDisplayValue(): string {
        let value: any = PropertyUtils.getValueFromObject(this.row, this.column.config.key);
        return UiTableUtils.getCellDisplayValue(value, this.row, this.column);
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private _sanitize(html: string): SafeHtml {
        return this._sanitizer.bypassSecurityTrustHtml(html);
    }
}