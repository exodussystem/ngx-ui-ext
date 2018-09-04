/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 1/25/2017.
 */

import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, Input } from "@angular/core";
import { LoadingService } from "./loading.service";

declare var Spinner: any;

// Usage:
//
// ** In HTML/Template **
//
// <ui-loading-mask [viewId]="workspace">
//     <!-- page content -->
// </ui-loading-mask>
//
// ** In Component ***
//
// constructor(private _loadingService: LoadingService, ...) {}
//
// *** turn on loading indicator :
// this._loadingService.setViewLoading(true, 'workspace');
//
// ** turn off loading indicator :
// this._loadingService.setViewLoading(false, 'workspace');

@Component({
    selector: 'ui-loading-mask',
    template: `
<div *ngIf="isLoading">
    <div #loadingContainer></div>
</div>
<div [class.ui-loading-mask]="isLoading">
    <ng-content></ng-content>
</div>
    `,
    styles: [`
.ui-loading-mask:after {
	content: '\\A';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(255,255,255,0.6);
	opcacity: 1;
	z-index: 9999;
}
    `]
})
export class UiLoadingMaskComponent implements OnInit, AfterViewInit {

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input()
    viewId: string = LoadingService.APP_VIEW;

    // -------------------------------------------------------------------------
    // Public Properties
    // -------------------------------------------------------------------------

    @ViewChildren('loadingContainer')
    public loadingContainer: QueryList<any>;

    public isLoading: boolean = false;

    // -------------------------------------------------------------------------
    // Private Properties
    // -------------------------------------------------------------------------

    private _spinner = new Spinner();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _loadingService: LoadingService) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    ngAfterViewInit() {
        // subscribe to any changes to the containers which
        // should change from undefined to an actual value
        // (which triggers *ngIf to show the component)
        if (this.loadingContainer) {
            this.loadingContainer.changes.subscribe(
                (result) => {
                    if (this.isLoading && result.first) {
                        result.first.nativeElement.appendChild(this._spinner.el);
                    }
                }
            ); // end subscribe
        }
    }

    ngOnInit() {
        // initialize the value
        this._loadingService.getViewLoadingObservable(this.viewId)
            .subscribe(isLoading => {
                this.isLoading = isLoading;
                this.isLoading ? this._spinner.spin() : this._spinner.stop();
            });
    }
}
