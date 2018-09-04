/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/29/2017.
 */

import { Component, Input } from "@angular/core";
import { SLIDE_UPDOWN_ANIMATION } from "../common/animation/slide-up-down.animation";

@Component({
    selector: 'ui-collapsible-panel',
    template: `
        <div class="panel {{panelClass}}" 
                [stickyBody]="stickyHeader" [stickyTop]="stickyTop" [stickyContainer]="stickyContainer">
            <div class="panel-heading {{headerClass}}" [stickyElement]="stickyHeader" [stickyClass]="'stickyOn'">
                <ng-content select="[panel-title]"></ng-content>
                <span class="panel-heading-btn pull-right clickable" (click)="toggleVisible();"
                      [attr.title]="visible ? collapseTitle : expandTitle"
                      [attr.aria-label]="visible ? collapseTitle : expandTitle">
                    <i [ngClass]="visible ? expandClass : collapseClass"></i>
                </span>
            </div>
            <div class="panel-body {{bodyClass}}" [@slideUpDown]="visibleAnimate ? 'expanded':'collapsed'"
                        (@slideUpDown.done)="animationDone($event)">
                <ng-content></ng-content>
            </div>
        </div>
    `,
    styles: [`
    .panel-body {
        overflow: hidden;
    }
    /* hide button when panel header got sticky */
    .panel-heading.stickyOn .panel-heading-btn {
        display: none;
    }
    `],
    animations: [SLIDE_UPDOWN_ANIMATION]
})
export class UiCollapsiblePanelComponent {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    public visible: boolean = true;
    public visibleAnimate: boolean = true;

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------
    @Input() panelClass: string;
    @Input() headerClass: string;
    @Input() bodyClass: string;

    // Bootstrap Glyphs: 'glyphicon glyphicon-chevron-up'
    // Font Awesome: 'fa fa-compress'
    @Input() collapseClass: string = 'glyphicon glyphicon-chevron-up';

    // Bootstrap Glyphs: 'glyphicon glyphicon-chevron-down'
    // Font Awesome: 'fa fa-expand'
    @Input() expandClass: string = 'glyphicon glyphicon-chevron-down';

    @Input() collapseTitle: string = 'Click to collapse';
    @Input() expandTitle: string = 'Click to expand';

    @Input() stickyHeader: boolean = false;
    @Input() stickyTop: number;
    @Input() stickyContainer: string;

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    toggleVisible() {
        this.visibleAnimate = !this.visibleAnimate;
    }

    animationDone($event) {
        // update the class and title after animation is done
        this.visible = $event.toState === 'expanded';
    }
}