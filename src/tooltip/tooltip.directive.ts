/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 1/13/2017.
 */

import {
    Directive,
    HostListener,
    ComponentRef,
    ViewContainerRef,
    Input,
    ComponentFactoryResolver,
    OnChanges,
    OnInit,
    OnDestroy
} from "@angular/core";
import { UiTooltipPopupComponent } from './tooltip-popup.component';

@Directive({
    selector: "[uiTooltip]"
})
export class UiTooltipDirective implements OnInit, OnDestroy, OnChanges {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _tooltipRef: ComponentRef<UiTooltipPopupComponent>;
    private _tooltip: UiTooltipPopupComponent;
    private _visible: boolean;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _viewContainerRef: ViewContainerRef,
                private _resolver: ComponentFactoryResolver) {
    }

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input("uiTooltip")
    content: string|UiTooltipPopupComponent;

    @Input("uiTooltipDisabled")
    tooltipDisabled: boolean = false;

    @Input("uiTooltipAnimation")
    tooltipAnimation: boolean = true;

    @Input("uiTooltipPlacement")
    tooltipPlacement: "top"|"bottom"|"left"|"right" = "bottom";

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    @HostListener("focusin")
    @HostListener("mouseenter")
    show(): void {
        if (this.tooltipDisabled || this._visible)
            return;

        this._visible = true;
        if (this._tooltip)
            this._tooltip.show();
    }

    @HostListener("focusout")
    @HostListener("mouseleave")
    hide(): void {
        if (!this._visible)
            return;

        this._visible = false;
        if (this._tooltip)
            this._tooltip.hide();
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    ngOnChanges(changes: any): void {
        if (changes.tooltipDisabled) {
            (changes.tooltipDisabled.currentValue) ? this.hide() : this.show();
        }
    }

    ngOnInit(): void {
        if (typeof this.content === "string") {
            const tooltipContentFactory = this._resolver.resolveComponentFactory(UiTooltipPopupComponent);
            this._tooltipRef = this._viewContainerRef.createComponent(tooltipContentFactory);
            this._tooltip = this._tooltipRef.instance;

            this._tooltip.hostElement = this._viewContainerRef.element.nativeElement;
            this._tooltip.content = this.content as string;
            this._tooltip.placement = this.tooltipPlacement;
            this._tooltip.animation = this.tooltipAnimation;

        } else {
            this._tooltip = this.content as UiTooltipPopupComponent;
            this._tooltip.hostElement = this._viewContainerRef.element.nativeElement;
            this._tooltip.placement = this.tooltipPlacement;
            this._tooltip.animation = this.tooltipAnimation;
        }
    }

    ngOnDestroy(): void {
        // if tooltip content was created dynamically, destroy it
        if (this._tooltipRef)
            this._tooltipRef.destroy();

        this._tooltip = null;
    }
}
