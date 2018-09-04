/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 6/11/2017.
 */

import { Directive, ViewContainerRef, Input, OnDestroy, AfterContentInit } from '@angular/core';
import { AnchorService } from './anchor.service';
import { RandomUtils } from '../common/utils/random-utils';

@Directive({selector: '[uiAnchor]'})

export class AnchorDirective implements AfterContentInit, OnDestroy {

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input('uiAnchor')
    public anchorId: string;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _viewContainer: ViewContainerRef) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    // implements AfterContentInit
    ngAfterContentInit(): void {
        // if id is not passed via directive, then use the element id
        if (this.anchorId === undefined || this.anchorId.length === 0) {
            this.anchorId = this._viewContainer.element.nativeElement.id;
        }
        // if the element id is not set, then create an ID and save as element data attribute
        if (this.anchorId === undefined || this.anchorId.length === 0) {
            this.anchorId = RandomUtils.getUUID();
            this._viewContainer.element.nativeElement.setAttribute('data-anchor-id', this.anchorId);
        }

        AnchorService.register(this.anchorId, this._viewContainer);
    }

    // implements OnDestroy
    ngOnDestroy(): void {
        AnchorService.deregister(this.anchorId);
    }
}