/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/27/2017.
 */

import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/observable/fromEvent';
import { MatchedOption } from '../option/option.interface';
import { ISelectEvent, UiSelectState } from './select.state';
import { FADE_INOUT_ANIMATION, SLIDE_UPDOWN_ANIMATION } from '../../common/animation';
import { isNotControlKey, Key, PropertyUtils } from '../../common/utils';
import { PositionService } from '../position/position.service';

@Component({
    selector: 'ui-select-popup',
    host: {
        // 'class': 'open',
        // '[class]': `'open ' + state.settings.popupClass`,
        '[@slideUpDown]': `state.settings.animation ? (isVisible ? 'expanded':'collapsed') : ''`,
        '(@slideUpDown.start)': 'startAnimation($event)',
        '(@slideUpDown.done)': 'endAnimation($event)'
    },
    styles: [`
        :host {
            position: absolute !important;
            display: block;
            width: 100%; 
            padding: 4px 4px 4px 0; 
            margin: 0;
            z-index: 9999;
            list-style: none;
            font-size: 15px;
            text-align: left;
            background-color: #fff;
            border: 1px solid #ccc;
            /*border: 1px solid rgba(0, 0, 0, 0.15);*/
            border-radius: 4px;
            -webkit-box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
            background-clip: padding-box;
        }
        a {
            outline: none !important;
        }

        ul.dropdown-menu {
            display: block;
            margin-top: 0;
            height: auto; 
            max-height: 200px;
            overflow-x: hidden;
            overflow-y: auto;
        }
        li.dropdown-item a {
            display: block;
            padding: 3px 20px;
            clear: both;
            font-weight: 400;
            line-height: 1.42857143;
        }
        li.dropdown-item {
            cursor: pointer;
        }

        ul.multiple li.dropdown-item a {
            padding: 3px 10px;
        }
        /* icon width in multiple mode */
        ul.multiple li.dropdown-item a span:first-child {
            width: 16px;
        }
        .dropdown-menu > .selected > a,
        .dropdown-menu > .selected > a:hover {
            color: #fff;
            text-decoration: none;
            outline: 0;
            background-color: #1460aa;
        }
        .searchbox {
            padding: 0 0 4px 4px;
        }
        .dropdown-menu.inner {
            border: 0 none;
            border-radius: 0;
            box-shadow: none;
            float: none;
            margin: 0;
            padding: 0;
            position: static;
        }
    `],
    template: `
<!-- default options item template -->
<ng-template #defaultItemTemplate let-match="match" let-settings="settings">
    <span [ngClass]="state.settings.itemClass" [innerHtml]="match.display"></span>
</ng-template>

<div *ngIf="state.settings.enableSearch" class="searchbox">
    <input #uiSelectFilter type="text" class="form-control" placeholder="{{state.settings.searchPlaceholder}}"
           autocomplete="off" role="textbox" aria-label="Search"
           [(ngModel)]="searchFilterText" (inputReset)="clearFilter($event)" uixReset>
</div>
<ul #uiSelectControls *ngIf="state.multiple && (state.settings.showCheckAll || state.settings.showUncheckAll)"
    class="dropdown-menu inner multiple"
    role="menu" aria-expanded="true" (mouseleave)="selectActive(null)">
    <li class="dropdown-item" *ngIf="state.settings.showCheckAll">
        <a href role="menuitem" tabindex="-1" (click)="checkAll($event)" (mouseenter)="selectActive(null)">
            <span style="display: inline-block;">
                <i uiIcon name="check"></i>
            </span>
            <span>{{ state.settings.checkAllText }}</span>
        </a>
    <li class="dropdown-item" *ngIf="state.settings.showUncheckAll">
        <a href role="menuitem" tabindex="-1" (click)="uncheckAll($event)" (mouseenter)="selectActive(null)">
            <span style="display: inline-block;">
                <i uiIcon name="remove"></i>
            </span>
            <span>{{ state.settings.uncheckAllText }}</span>
        </a>
    </li>
    <li class="dropdown-divider divider"></li>
</ul>
<ul #uiSelectOptions class="dropdown-menu inner" 
    role="menu" aria-expanded="true" (mouseleave)="selectActive(null)"
    [ngClass]="{'multiple': state.multiple}" [style.max-height]="state.settings.maxHeight">
    <ng-container *ngIf="state.multiple">
        <ng-container *ngFor="let match of state.matches;let i = index">
        <li *ngIf="match.isHeader() && i > 0" class="divider"></li>
        <li *ngIf="match.isHeader()" class="dropdown-header">{{match}}</li>
        <li *ngIf="!match.isHeader()" class="dropdown-item" role="menuitem" [class.active]="isActive(match)"
            attr.data-value="{{match.value}}" (mouseenter)="selectActive(match)"
            [@fadeInOut] [@.disabled]="!state.settings.animation">
            <a href (click)="selectMatch(match, $event)" tabindex="-1">
                <input *ngIf="!state.settings.checkedIcon" type="checkbox" [checked]="isSelected(match)"
                       (click)="preventCheckboxCheck($event, match)"/>
                <span *ngIf="state.settings.checkedIcon" style="display: inline-block;">
                    <i *ngIf="isSelected(match)" uiIcon name="check"></i>
                </span>
                <ng-template [ngTemplateOutlet]="state.itemTemplate || defaultItemTemplate"
                             [ngOutletContext]="{index:i, match:match, query:state.query, settings:state.settings}">
                </ng-template>
            </a>
        </li>
        </ng-container>
    </ng-container>

    <ng-container *ngIf="!state.multiple">
        <ng-container *ngFor="let match of state.matches;let i = index">
            <li *ngIf="match.isHeader() && i > 0" class="divider"></li>
            <li *ngIf="match.isHeader()" class="dropdown-header">{{match}}</li>
            <li *ngIf="!match.isHeader()" class="dropdown-item" role="menuitem" attr.data-value="{{match.value}}"
                (mouseenter)="selectActive(match)" [class.active]="isActive(match)" [class.selected]="isSelected(match)"
                [@fadeInOut] [@.disabled]="!state.settings.animation">
                <a href (click)="selectMatch(match, $event)" tabindex="-1">
                    <ng-template [ngTemplateOutlet]="state.itemTemplate || defaultItemTemplate"
                                 [ngOutletContext]="{index:i, match:match, query:state.query, settings:state.settings}">
                    </ng-template>
                </a>
            </li>
        </ng-container>
    </ng-container>
</ul>
    `,
    animations: [SLIDE_UPDOWN_ANIMATION, FADE_INOUT_ANIMATION]
})
export class UiSelectPopupComponent implements OnInit, AfterViewInit, OnDestroy {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    public state: UiSelectState;
    public searchFilterText: string = '';
    public parentElement: HTMLElement;
    public isVisible: boolean = true;

    private _setFocus: boolean = false;
    private _subscriptions: Subscription[];
    private _filterElement: ElementRef;

    @ViewChild('uiSelectOptions', {read: ElementRef})
    private _selectOptions: ElementRef;

    @ViewChild('uiSelectControls', {read: ElementRef})
    private _selectControls: ElementRef;

    @ViewChild('uiSelectFilter', {read: ElementRef})
    set filterElementRef(element: ElementRef) {
        if (element && !this._filterElement) {
            this._filterElement = element;
            this._initFilterElement();
        }
    }

    @HostBinding('class')
    get popupClass(): string {
        return (this.state.settings.popupClass||'') + (this.state.isDropdown ? ' dropdown open' : ' dropup open');
    }

    @HostBinding('style.width')
    get width(): string {
        if (!this.state.settings.bodyContainer) {
            let targetWidth = this.state.settings.width || 'fit';
            // since this component is not attached to body and its position is relative
            // width value of '100%' will be as same as the size of popup button
            if (targetWidth === 'auto') {
                return '100%';
            }
            // when width is 'auto', the popup will have size that fits all of elements
            if (targetWidth === 'fit') {
                return 'auto';
            }
            return targetWidth;
        }
        return '';
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _element: ElementRef,
                private _ngZone: NgZone,
                private _cdr : ChangeDetectorRef,
                private _posService: PositionService) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit(): void {
        this._subscriptions = [
            this._listenToPositionChange(),
            this._listenToActiveChange(),
            this._listenToCollapse()
        ];
    }

    // implements AfterContentInit
    ngAfterViewInit(): void {
        // positioning popup
        if (this.state.settings.bodyContainer)
            this._updatePosition();

        // make highlighted option visible within scrolling popup
        this._scrollToLastSelection();

        // focus the search input if enabled
        if (this.state.settings.enableSearch && this._filterElement) {
            this._filterElement.nativeElement.focus();
        }

        if (this.state.selected && this.state.selected.length > 0)
            this._cdr.detectChanges();
    }

    // implements OnDestroy
    ngOnDestroy(): void {
        this.state = null;
        this.parentElement = null;
        // unsubscribe
        this._subscriptions.forEach(sub => sub && sub.unsubscribe());
        this._subscriptions.length = 0;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    //
    // MULTIPLE MODE
    //

    // select all options
    checkAll(event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        // select all matches
        this.state.selectAll();
    }

    // deselect all
    uncheckAll(event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.state.deselectAll();
    }

    // disallow selecting more if hitting the limit
    preventCheckboxCheck(event: Event, matchedOption: MatchedOption) {
        if (event && this.state.isLimitReached(matchedOption.item)) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    //
    // FILTER MODE
    //

    clearFilter() {
        this.searchFilterText = '';
        this.state.generateMatches();
        this._filterElement.nativeElement.focus();
    }

    //
    // ACTIVE & SELECT
    //

    isActive(matchedOption: MatchedOption): boolean {
        return this.state.active === matchedOption.item;
    }

    selectActive(matchedOption: MatchedOption): void {
        this.state.active = matchedOption ? matchedOption.item : null;
    }

    isSelected(matchedOption: MatchedOption): boolean {
        return this.state.selected.indexOf(matchedOption.item) > -1;
    }

    selectMatch(matchedOption: MatchedOption, event: Event = void 0): boolean {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.state.active = null;
        this.state.select(matchedOption.item);
        if (this._filterElement)
            this._filterElement.nativeElement.focus();
        return false;
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    // if parent element size/position has been changed
    private _listenToPositionChange(): Subscription {
        if (this.state.settings.bodyContainer)
            return this._ngZone.onStable.subscribe(() => {
                this._updatePosition()
            });
        return null;
    }

    private _updatePosition() {
        let currentDropdown: boolean = this.state.isDropdown;
        let newPlacement: string = this._posService.position({
                                        element: this._element.nativeElement,
                                        target: this.parentElement,
                                        attachment: this.state.placement,
                                        appendToBody: this.state.settings.bodyContainer,
                                        width: this.state.settings.width
                                    });
        this.state.isDropdown = (newPlacement.indexOf('bottom') >= 0 || newPlacement.indexOf('top') === -1);
        if (currentDropdown !== this.state.isDropdown) {
            this.state.placement = newPlacement;
            // this._cdr.detectChanges();

        }
    }

    private _listenToActiveChange(): Subscription {
        return this.state.selectionChange$
            .filter((event: ISelectEvent) => event && event.eventName==='activeChanged')
            .subscribe((event: ISelectEvent) => {
                if (this.state.active) {
                    this._scrollToOption(this.state.active);
                }
            });
    }

    // support animation
    private _listenToCollapse(): Subscription {
        // only when animation is enabled
        if (!this.state.settings.animation)
            return null;
        // listen to event to close the drop due to clicking outside controls
        return this.state.selectionChange$
            .filter((event: ISelectEvent) => event && event.eventName==='collapsePopup')
            .subscribe(() => { this.startCollapse(false); });
    }

    // start collapse animation
    protected startCollapse(setFocus: boolean) {

        // this._startCollapsing = true;
        this.isVisible = false;
        this._setFocus = setFocus;
    }

    protected startAnimation(event: AnimationEvent): void {
        if (!this.state || !this.state.settings.animation || !event)
            return;

        if (event.toState === 'collapsed') {
            // this._startCollapsing = true;
        }
        else if (event.toState === 'expanded') {
            // this._startExpanding = true;
        }
    }

    // handle animation end (collapse)
    protected endAnimation(event: AnimationEvent) {
        if (!this.state || !this.state.settings.animation || !event)
            return;

        if (event.toState === 'collapsed') {
            if (this._setFocus && this._filterElement) {
                // set focus back to the select if the focus is still with the filter element
                let setFocusWhenClose: boolean =
                    (this._filterElement.nativeElement
                    && this._filterElement.nativeElement === document.activeElement);
                this._closePopup(setFocusWhenClose);
            }
            else {
                this._closePopup(false);
            }
        }
    }

    // emit event to close the popup
    private _closePopup(setFocus: boolean = true) {
        this.state.notifyChange({source: 'popup', eventName: 'closePopup', setFocus: setFocus});
    }

    // scroll to the last selected (matched) option
    private _scrollToLastSelection() {
        // look up the last selected option
        let lastSelected = this.state.getLastSelected();
        if (lastSelected) {
            // set it as active and scroll into view
            this.state.active = lastSelected;
            this._scrollToOption(lastSelected)
        }
    }

    // scroll to specific option
    private _scrollToOption(option: any) {
        let value = PropertyUtils.getValueFromObject(option, this.state.settings.optionValueField);
        let ulElement = this._selectOptions.nativeElement;
        let liElement: HTMLElement = <HTMLElement>ulElement.querySelector('li[data-value="' + value +'"]');
        if (!liElement) return;
        let topOffset: number = this._filterElement
                                    ? this._filterElement.nativeElement.offsetHeight + 8 // margin top (4px) and bottom (4px)
                                    : 0;
        // bottom most position needed for viewing
        let bottom: number  = (ulElement.scrollTop + (ulElement.offsetHeight) - liElement.offsetHeight);

        if ((this.state.settings.showCheckAll || this.state.settings.showUncheckAll) && this._selectControls) {
            topOffset += this._selectControls.nativeElement.offsetHeight;
        }

        // top most position needed for viewing
        let top: number  = ulElement.scrollTop;// + fudge;
        let liTop: number = liElement.offsetTop - topOffset;

        if (liTop <= top){
            // move to top position if LI above it
            // use algebra to subtract fudge from both sides to solve for ulElement.scrollTop
            ulElement.scrollTop = liElement.offsetTop - topOffset;
        }
        else if (liTop >= bottom) {

            // move to bottom position if LI below it
            // use algebra to subtract ((ulElement.offsetHeight - fudge) - liElement.offsetHeight)
            // from both sides to solve for ulElement.scrollTop
            ulElement.scrollTop =
                liElement.offsetTop - (ulElement.offsetHeight - liElement.offsetHeight) - topOffset;
        }

    }

    private _initFilterElement(): void {
        this._subscriptions.push(this.state.subscribeFilterChange(this._filterElement.nativeElement));

        // event originated from popup
        this._subscriptions.push(
            Observable.fromEvent(this._filterElement.nativeElement, 'keydown')
                .filter((event: KeyboardEvent) => !isNotControlKey(event.keyCode))
                .subscribe((event: KeyboardEvent) => {
                    if (event.keyCode !== Key.Tab && event.shiftKey) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                    if (event.keyCode === Key.ArrowDown) {
                        this.state.activateNextMatch();
                    }
                    else if (event.keyCode === Key.ArrowUp) {
                        this.state.activatePreviousMatch();
                    }
                    else if (event.keyCode === Key.Escape
                        || (event.keyCode == Key.Tab && !event.shiftKey)) {
                        this.state.active = null;
                        if (this.state.settings.animation) {
                            this.startCollapse(true);
                        }
                        else {
                            this._closePopup(event.keyCode === Key.Escape);
                        }
                    }
                    else if (event.keyCode === Key.Enter) {
                        if (this.state.active) {
                            this.state.select(this.state.active);
                            this._filterElement.nativeElement.focus();
                        }
                    }
                })
        );

        this._subscriptions.push(this.state.selectionChange$
            .filter((event: ISelectEvent) => event && event.eventName==='focusChanged')
            .subscribe((event: ISelectEvent) => {
                this._filterElement.nativeElement.focus();
            }));
    }
}