/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 4/20/2017.
 */

import {
    Component,
    Input,
    ViewContainerRef,
    ComponentRef,
    ViewChild,
    ElementRef,
    ComponentFactoryResolver,
    OnInit, Output, EventEmitter
} from "@angular/core";
import { AnimationEvent } from '@angular/animations';
import { UiTableState } from "../config/table-state";
import { SLIDE_UPDOWN_ANIMATION } from "../../common/animation/slide-up-down.animation";

// Base component to override to provide
// custom component rendered in table cell
@Component({
    selector: '[uiDetailTableCell]',
    template: `
        <div [@slideUpDown]="visible ? 'expanded':'collapsed'" (@slideUpDown.done)="onAnimationStop($event)"
             style="display: block; overflow: hidden">
            <ng-template #cmpContainer></ng-template>
        </div>`,
    animations: [SLIDE_UPDOWN_ANIMATION]
})
export class UiDetailTableCellComponent implements OnInit {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    @ViewChild('cmpContainer', {read: ViewContainerRef})
    cmpContainer: ViewContainerRef;

    private _cmpRef: ComponentRef<any>;

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input() row: Object;
    @Input() visible: boolean;
    @Output() onToggle: EventEmitter<boolean> = new EventEmitter();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _element: ElementRef,
                private _resolver: ComponentFactoryResolver,
                public state: UiTableState) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle listeners
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit(): void {
        if (this.state
            && this.state.config
            && this.state.config.rowConfig
            && this.state.config.rowConfig.detailComponent) {
            const factory = this._resolver.resolveComponentFactory(this.state.config.rowConfig.detailComponent);
            this._cmpRef = this.cmpContainer.createComponent(factory);
            const instance: any = this._cmpRef.instance;
            instance['row'] = this.row;
        }
    }

    // implements OnDestroy
    ngOnDestroy(): void {
        // cleanup - destroy previously created component
        if (this._cmpRef)
            this._cmpRef.destroy();
    }

    public onAnimationStop(event: AnimationEvent) {
        // entering animation finished
        if (event.toState === 'expanded') {

            this.onToggle.emit(true);

        }
        // exiting animation finished
        else if (event.toState === 'collapsed') {

            this.onToggle.emit(false);
        }
    }
}