/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 6/21/2017.
 *
 * Original Author:
 *  Oren Farhi
 * Article:
 *  Lessons Learned from Creating A Typeahead With RxJs And Angular (2+)
 *  http://orizens.com/wp/topics/lessons-learned-from-creating-a-typeahead-with-rxjs-and-angular-2/
 * Source:
 *  https://github.com/orizens/echoes-player
 */

import {
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ComponentRef,
    Injector,
    ApplicationRef,
    ComponentFactoryResolver,
    HostListener,
    AfterContentInit,
    Optional,
    ViewContainerRef,
    Directive
} from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/observable/fromEvent';
import { NgControl, FormControl, NgModel } from '@angular/forms';
import { ITypeaheadSettings } from './typeahead.interface';
import { UiTypeaheadPopupComponent } from './typeahead-popup.component';
import { ITypeaheadEvent, UiTypeaheadState } from './typeahead.state';
import { Key, DomUtils } from '../../common/utils';
import { MatchedOption } from '../option/option.interface';

@Directive({
    selector: '[uiTypeahead]',
    host: {
        '[class.is-focused]': 'hasFocus',
    },
    exportAs: 'uiTypeahead'
})
export class UiTypeaheadDirective implements OnInit, AfterContentInit, OnDestroy {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    public state: UiTypeaheadState;
    public hasFocus: boolean = false;

    private _isVisible: boolean = false;    // indicates that whether popup is open
    private _subscriptions: Subscription[] = []; // subscriptions that _listening to events
    private _popup: ComponentRef<UiTypeaheadPopupComponent>;

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    /** options source, can be Array of strings, objects or an Observable for external matching process */
    @Input("uiTypeahead")
    set options(value: Array<any>) {
        this.state.setOptions(value);
    }

    @Input("taSettings")
    set settings(value: ITypeaheadSettings) {
        this.state.setSettings(value);
    }

    @Input("taItemTemplate")
    set itemTemplate(value: TemplateRef<any>) {
        this.state.itemTemplate = value;
    }

    /** used to specify a custom options list template. Template variables: matches, itemTemplate, query */
    @Input("taOptionsTemplate")
    set optionsTemplate(value: TemplateRef<any>) {
        this.state.optionsTemplate = value;
    }

    /** fired when 'busy' state of this component was changed, fired on async mode only, returns boolean */
    @Output()
    typeaheadLoading: EventEmitter<boolean> = new EventEmitter();

    /** fired on every key event and returns true in case of matches are not detected */
    @Output()
    typeaheadNoResults: EventEmitter<boolean> = new EventEmitter();

    /** fired when option was selected, return object with data of this option */
    @Output()
    typeaheadOnSelect: EventEmitter<any> = new EventEmitter();

    /** fired when blur event occurres. returns the active item */
    @Output()
    typeaheadOnBlur: EventEmitter<any> = new EventEmitter();

    // check if use clicks outside of input and popup
    @HostListener('document: click', ['$event.target'])
    onClickOutside(target: HTMLElement) {
        // would not bother if popup is not opened
        // would not bother if popup is not opened
        if (!this._isVisible) {
            this.hasFocus = false;
            return;
        }
        // find if the click event is targeted to this component or the popup container component
        if (!this._element.nativeElement.contains(target) &&
            (!this._popup || !this._popup.location.nativeElement.contains(target))) {
            this._onBlur();
            this.hasFocus = false;
        }
    }

    @HostListener('focus', ['$event'])
    onFocus($event) {
        this.hasFocus = true;
    }

    @HostListener('blur', ['$event'])
    onBlur($event) {
        if (!this._isVisible)
            this.hasFocus = false;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(@Optional() private _control: NgControl,
                @Optional() private _model: NgModel,
                private _element: ElementRef,
                private _viewContainer: ViewContainerRef,
                private _resolver: ComponentFactoryResolver,
                private _applicationRef: ApplicationRef,
                private _defaultInjector: Injector) {
        this.state = new UiTypeaheadState();
        // disable browser autocomplete
        if (this._element){
            DomUtils.turnOffAutocomplete(this._element.nativeElement);
            this._subscriptions.push(this.state.subscribeFilterChange(this._element.nativeElement));
        }
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    // implements OnInit
    ngOnInit() {
        this._subscriptions.push(this._listenToKeySelection());
        this._subscriptions.push(this._listenToFocusChange());
        this._subscriptions.push(this._listenToSelectionChange());
        this._subscriptions.push(this._listenToModelChange());
        this._subscriptions.push(this._listenToKeyNavigation());
    }

    // implements AfterContentInit
    ngAfterContentInit() {
        if (this._control && !!this._control.value && this._control.value.length>0) {

            this._onModelChange(<string>this._control.value);
        }
        else if (this._model && this._model.toString().length > 0) {

            this._onModelChange(this._model.toString());
        }
    }

    // implements OnDestroy
    ngOnDestroy() {
        this.state.onDestroy();
        // unsubscribe all subscriptions
        this._subscriptions.forEach(sub => sub.unsubscribe());
        this._subscriptions.length = 0;
    }

    // -------------------------------------------------------------------------
    // Public API Methods
    // -------------------------------------------------------------------------

    get api() {
        return {
            isActive: (matchedOption: MatchedOption): boolean => {
                return this.state.active === matchedOption.item;
            },

            setActive: (matchedOption: MatchedOption): void => {
                let active = matchedOption ? matchedOption.item : null;
                if (this.state.active !== active) {
                    this.state.active = active;
                    this.state.onActiveChanged();
                }
            },

            setSelected: (matchedOption: MatchedOption, event: Event = void 0): boolean => {
                if (event) {
                    event.stopPropagation();
                    event.preventDefault();
                }
                return this.state.select(matchedOption.item);
            },

            matches: (): Array<MatchedOption> => {
                return this.state.matches;
            }
        };
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    // Listening to selection change originated from the popup
    private _listenToSelectionChange(): Subscription {
        return this.state.stateChange$
            .subscribe((event: ITypeaheadEvent) => {
                // if the user selects an option by clicking on one
                if (event.eventName === 'selectChanged') {
                    this._updateModel();
                    if (this._isVisible) {
                        this._closePopup();
                        this._element.nativeElement.focus();
                    }
                }
                // if the user changes the active options by moving mouse or pressing Up/Down arrow button
                else if (event.eventName === 'activeChanged') {
                    this._element.nativeElement.value = event.value;
                }
                // if user changes the keyword and results to new matches
                else if (event.eventName === 'matchesChanged') {

                    this.typeaheadLoading.emit(event.value === 'start');

                    if (event.value === 'finished') {
                        let hasMatches: boolean = this.state && this.state.matches.length > 0;

                        this.typeaheadNoResults.emit(!hasMatches);
                        // if some matches found
                        if (hasMatches) {
                            if (!this._isVisible)
                                this._openPopup();
                        }
                        // no match, close and return
                        else if (this._isVisible) {
                            this._closePopup();
                        }
                    }
                }
            });
    }

    // Listening to navigation keys (Enter/Left/Right) that will change the selection
    private _listenToKeySelection(): Subscription {
        return Observable.fromEvent(this._element.nativeElement, 'keydown')
            .filter((event: KeyboardEvent) =>
                (event.keyCode === Key.Enter
                || event.keyCode === Key.ArrowLeft
                || event.keyCode === Key.ArrowRight ))
            .subscribe((event: KeyboardEvent) => {
                // if drowpdown is opened and user clicks Enter/Left Arrow/Right Arrow
                if (this._isVisible && this.state.active) {
                    // prevent to submit form
                    event.stopPropagation();
                    event.preventDefault();

                    // select current active option
                    return this.state.select(this.state.active);
                }
            });
    }

    // Listening to navigation keys (Tab & Escape) that will change the focus
    private _listenToFocusChange(): Subscription {
        return Observable.fromEvent(this._element.nativeElement, 'keydown')
            .filter((event: KeyboardEvent) => event.keyCode === Key.Escape || event.keyCode === Key.Tab)
            .subscribe((event: KeyboardEvent) => {
                // only emit blur event when navigating away with tab
                // when hitting escape, just close the popup
                this._onBlur(event.keyCode === Key.Tab);
                return false;
            });
    }

    // Since this is a directive, model can be changed/updated by other directives/components
    // Listening to external model change and refresh internal state
    private _listenToModelChange() {
        if (this._model) {
            return this._model.valueChanges.subscribe((newValue) => {
                if (!this._isVisible)
                    this._onModelChange(newValue);
            });
        }
        else if (this._control) {
            return (this._control.control as FormControl).valueChanges.subscribe((newValue) => {
                if (!this._isVisible)
                    this._onModelChange(newValue);
            });
        }
        return null;
    }

    // Listening to arrow key (Up & Down)
    private _listenToKeyNavigation(): Subscription {
        return Observable.fromEvent(this._element.nativeElement, 'keydown')
            .filter((event: KeyboardEvent) => event.keyCode === Key.ArrowDown || event.keyCode === Key.ArrowUp)
            .subscribe((event: KeyboardEvent) => {

                // prevent the cursor from moving to beginning of the text
                event.stopPropagation();
                event.preventDefault();

                // if popup is not opened yet
                if (!this._isVisible) {
                    // regenerate matches from keyword
                    this.state.generateMatches(this.state.keyword);
                }
                else { // if it is currently opened, go to previous / next match
                        if (event.keyCode === Key.ArrowDown) {
                            this.state.activateNextMatch();
                        }
                        else if (event.keyCode === Key.ArrowUp) {
                            this.state.activatePreviousMatch();
                        }
                    }
            });
    }

    private _onBlur(focusLost: boolean = true) {

        if (this._isVisible) {
            // if active is not empty, focus is on active option
            if (!this.state.selected) {
                // show entered keyword in the input text
                this._element.nativeElement.value = this.state.keyword;
            }
            // close the popup
            this._closePopup();
        }
        this.hasFocus = !focusLost;
        if (focusLost) {

            this.typeaheadOnBlur.emit(this.state.selected);
        }
    }

    private _openPopup() {

        this._isVisible = true;
        this.hasFocus = true;

        // dynamically create popup container component
        const factory = this._resolver.resolveComponentFactory(UiTypeaheadPopupComponent);
        this._popup = factory.create(this._defaultInjector);
        const instance: any = this._popup.instance;
        // copy data and configurations
        instance.state = this.state;
        instance.parentElement = this._element.nativeElement;

        if (this.state.settings.bodyContainer) {
            this._applicationRef.attachView(this._popup.hostView);
            // attach the container to the body
            document.body.appendChild(this._popup.location.nativeElement);
        }
        else {
            if (this._viewContainer.length > 1) {
                let index: number = DomUtils.getElementIndex(this._element.nativeElement);
                if (this._element.nativeElement.getAttribute('uiReset') !== undefined ||
                    this._element.nativeElement.getAttribute('uireset')!== undefined ) {
                    index = null;
                }
                else {
                    ++index
                }
                // create embedded view right next to input
                this._viewContainer.insert(this._popup.hostView, index);
            }
            else {
                // create embedded view right next to input
                this._viewContainer.insert(this._popup.hostView);
            }
        }
    }

    private _closePopup() {
        if (!this._isVisible)
            return;

        this._isVisible = false;
        if (this._popup) {
            this._applicationRef.detachView(this._popup.hostView);
            this._popup.destroy();
            this._popup = null;
        }
    }

    // Handle date model change from selector
    private _updateModel(): void {
        let value: string = this.state.getOptionValue(this.state.selected);

        if (this._control) {
            this._control.viewToModelUpdate(value);
            (this._control.control as FormControl).setValue(value);
        }
        else if (this._model) {
            this._model.viewToModelUpdate(value);
        }
        this.typeaheadOnSelect.emit(this.state.selected);
    }

     // Handle model change outside of this directive
     // For example,
     // - model is preset before directive initializes
     // - model is reset to blank
     // - model is set to different value
     // This function is resetting keywords, query and matched results
    private _onModelChange(newValue: string) {
        // if the value is reset by other directives
        if (!newValue || newValue.length==0) {

            this.state.reset();
            this._closePopup();
            return;
        }
        if (newValue !== this.state.getOptionValue(this.state.selected)) {

            this.state.generateMatches(newValue, true);
        }
    }
}
// @formatter:off
    /** NOTES: These are public APIs that will be used with custom option template
    For example:

     [form-with-custom-typeahead.html]

     <input [(ngModel)]="query"
             [uiTypeahead]="data"
             [taItemTemplate]="myCustomItemTemplate"
             [taOptionsTemplate]="myCustomListTemplate">

     <ng-template #myCustomListTemplate let-matches="matches" let-itemTemplate="itemTemplate" let-query="query">
        <div class="col-lg-12">
            <table class="table-hover table-striped">
			<thead>
				<th class="class-for-name-column">name</th>
				<th class="class-for-region-column">region</th>
			</thead>
            <tbody>
            <ng-template ngFor let-match let-i="index" [ngForOf]="matches">
             <!-- this is the group name -->
             <tr *ngIf="match.isHeader()">
                <td colspan="2" class="class-for-region-group">{{match}}</td>
             </tr>
             <tr *ngIf="!match.isHeader()" [class.active]="isActive(match)"
                                            (click)="setSelected(match, $event)" (mouseenter)="setActive(match)">
                <td>{{match.name}}</td>
                <td>{{match.region}}</td>
            </tr>
			</ng-template>
            </tbody>
            </table>
        </div>
     </ng-template>

     [form-with-custom-typeahead.ts]

     @ViewChild(UiTypeaheadDirective) typeahead: UiTypeaheadDirective;

     public statesComplex: any[] = [
        {id: 1, name: 'Alabama', region: 'South'},
        {id: 2, name: 'Alaska', region: 'West'},
        {id: 3, name: 'Arizona', region: 'West'},
        {id: 4, name: 'Arkansas', region: 'South'},
        ...
     ];
     public constructor() {}

     isActive(matchedOption: MatchedOption): boolean {
        return this.typeahead.api.isActive(matchedOption);
     }

     setActive(matchedOption: MatchedOption): void {
        return this.typeahead.api.setActive(matchedOption);
    }

    setSelected(matchedOption: MatchedOption, event: Event = void 0): boolean {
        return this.typeahead.api.setSelected(matchedOption);
    }

    get matches(): Array<MatchedOption> {
        return this.typeahead.api.matches;
    }

    **/
    // @formatter:on