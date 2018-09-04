import {
    Component,
    ElementRef,
    ViewEncapsulation,
    NgZone,
    OnInit,
    AfterContentInit,
    OnDestroy,
    HostBinding
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { MatchedOption } from '../option/option.interface';
import { UiTypeaheadState } from './typeahead.state';
import { PositionService } from '../../common/service';

@Component({
    selector: 'ui-typeahead-popup',
    // tslint:disable-next-line
    template: `
<!-- inject options list template -->
<ng-template [ngTemplateOutlet]="state.optionsTemplate || defaultContainerTemplate"
             [ngOutletContext]="{matches:state.matches, itemTemplate:state.itemTemplate, query:state.query, matchLatin:state.settings.matchLatin}"></ng-template>

<!-- default options item template -->
<ng-template #defaultItemTemplate let-match="match" let-query="query">
    <span [ngClass]="state.settings.itemClass" [innerHtml]="match.display"></span>
</ng-template>

<!-- Bootstrap 3 options list template -->
<ng-template #defaultContainerTemplate>
    <ul class="dropdown-menu" role="menu">
        <ng-template ngFor let-match let-i="index" [ngForOf]="state.matches">
            <li *ngIf="match.isHeader() && i > 0" class="divider"></li>
            <li *ngIf="match.isHeader()" class="dropdown-header">{{match}}</li>
            <li *ngIf="!match.isHeader()" role="menuitem" [class.active]="isActive(match)" (mouseenter)="setActive(match)">
                <a href="javascript:;" (click)="setSelected(match, $event)" tabindex="-1">
                    <ng-template [ngTemplateOutlet]="state.itemTemplate || defaultItemTemplate"
                                 [ngOutletContext]="{index:i, match:match, item:match.item, query:state.query, matchLatin:state.settings.matchLatin}"></ng-template>
                </a>
            </li>
        </ng-template>
    </ul>
</ng-template>
`,
    // tslint:disable
    host: {
        // 'class': 'dropdown open',
        '[class]': `'dropdown open ' + state.settings.popupClass`,
        style: 'display: block;'
    },
    // tslint: enable
    encapsulation: ViewEncapsulation.None
})
export class UiTypeaheadPopupComponent implements OnInit, AfterContentInit, OnDestroy {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    public state: UiTypeaheadState;
    public parentElement: HTMLElement;

    private _subscriptions: Subscription[];

    @HostBinding('style.position')
    get position(): string {
        return this.state.settings.bodyContainer ? 'absolute':'relative';
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _element: ElementRef,
                private _ngZone: NgZone,
                private _posService: PositionService) {}

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit(): void {
        this._subscriptions = [
            this._listenToPositionChange()
        ];
    }

    // implements AfterContentInit
    ngAfterContentInit(): void {
        if (this.state.settings.bodyContainer)
            this._updatePosition();
    }

    // implements OnDestroy
    ngOnDestroy(): void {
        this.state = null;
        // release all object references
        this.parentElement = null;
        // unsubscribe
        this._subscriptions.forEach(sub => sub && sub.unsubscribe());
        this._subscriptions.length = 0;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    isActive(matchedOption: MatchedOption): boolean {
        return this.state.active === matchedOption.item;
    }

    setActive(matchedOption: MatchedOption): void {
        let active = matchedOption ? matchedOption.item : null;
        if (this.state.active !== active) {
            this.state.active = active;
            this.state.onActiveChanged();
        }
    }

    setSelected(matchedOption: MatchedOption, event: Event = void 0): boolean {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        return this.state.select(matchedOption.item);
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    // if parent element size/position has been changed
    private _listenToPositionChange(): Subscription {
        if (this.state.settings.bodyContainer)
            return this._ngZone.onStable.subscribe(() => { this._updatePosition() });
        return null;
    }

    private _updatePosition() {
        this._posService.position({
            element: this._element.nativeElement,
            target: this.parentElement,
            attachment: this.state.settings.placement,
            appendToBody: this.state.settings.bodyContainer
        });
    }
}