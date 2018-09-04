/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/26/2017.
 */

import { Injectable, TemplateRef } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';
import { MatchedOption } from '../option/option.interface';
import { DEFAULT_SELECT_SETTINGS, ISelectSettings } from './select.interface';
import { OptionService } from '../option/option.service';
import { isNotControlKey, PropertyUtils } from '../../common/utils';

export interface ISelectEvent {
    // source of the event
    source?: 'input'|'popup';

    // event name
    // 'selectionAdded'|'selectionRemoved'|'selectionUpdated'|'limitReached'|'closePopup'|'activeChanged';
    eventName: string;

    options?: any[];

    setFocus?: boolean;
}

@Injectable()
export class UiSelectState {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    // settings
    public settings: ISelectSettings = Object.assign({}, DEFAULT_SELECT_SETTINGS);
    // templates
    public itemTemplate: TemplateRef<any>;
    public optionsTemplate: TemplateRef<any>;

    public isDropdown: boolean = true;  // false if dropup
    public multiple: boolean = false;
    public totalSelected: number = 0;
    public query: string|Array<string>; // (normalized) query string or list of query string
    public active: any;                 // active option (having focus)
    public options: Array<any>;         // original options
    public selected: Array<any> = [];   // selected options
    public matches: Array<MatchedOption> = [];// results from filtering options with search keyword
    public placement: string;

    private _optionService: OptionService;

    // Observable sources
    private _selectChangeSource: Subject<ISelectEvent> =
        new Subject<ISelectEvent>();

    // Observable streams
    public selectionChange$: Observable<ISelectEvent> =
        this._selectChangeSource.asObservable();

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    setSettings(value: ISelectSettings) {
        this.settings = Object.assign({}, DEFAULT_SELECT_SETTINGS, value);
        this._optionService = new OptionService(this.settings);
    }

    setOptions(value: Array<any>) {
        this.options = value;
    }

    setSelections(value: any): boolean {
        let modelChange: boolean = false;
        //if both old and new values are empty, return since nothing changes
        if (!this._hasValue(value) && !this._hasValue(this.selected)) {
            return modelChange;
        }
        // multiple mode
        if (this.multiple) {
            // reset array before copy or add value
            this.selected.splice(0);
            // this.selected.length = 0;
            if (this._hasValue(value)) {
                if (value.constructor === Array)
                    this.selected = this.selected.concat(value);
                else
                    this.selected.push(value);
            }
            modelChange = true;
        }
        // single mode
        else if (this.selected.indexOf(value) === -1) {
            // reset array before copy or add value
            // this.selected.length = 0;
            this.selected.splice(0);
            if (this._hasValue(value)) {
                // update only different value
                this.selected.push(value);
            }
            modelChange = true;
        }
        return modelChange;
    }

    getSelections(): any {
        if (this.multiple)
            return this.selected;
        else
            return this.selected.length > 0 ? this.selected[0] : null;
    }

    // notify change
    notifyChange(change: ISelectEvent): void {
        this._selectChangeSource.next(change);
    }

    getSelectionText(): string {
        this.totalSelected = this.selected.length;
        if (this.totalSelected === 0) {
            return null;
        }
        let selectionText: string;
        // multiple mode
        if (this.multiple) {
            if (this.settings.dynamicTitleMaxItems
                && this.settings.dynamicTitleMaxItems >= this.totalSelected) {
                selectionText = this.options
                    .filter((option) => this.selected.indexOf(option) > -1)
                    .map((option) => PropertyUtils.getValueFromObject(option, this.settings.optionDisplayField))
                    .join(', ');
            }
            else if (this.settings.showAllSelectedText
                && this.selected.length === this.options.length) {
                selectionText = this.settings.allSelectedText || '';
            }
            else {
                selectionText = this.totalSelected + ' '
                    + (this.totalSelected === 1
                        ? this.settings.checkedSingularText
                        : this.settings.checkedPluralText);
            }
        }
        // single mode
        else {
            selectionText = PropertyUtils.getValueFromObject(this.selected[0], this.settings.optionDisplayField);
        }

        return selectionText;
    }

    // select all options
    selectAll(): boolean {
        // if ALL are already selected, return
        if (this.selected.length === this.options.length)
            return false;

        let exclusion: Array<any> = this.options.filter( (option) => {
            return this.selected.indexOf(option) < 0;
        });

        // call this method to handle the selection limits
        // return this.addSelections(exclusion);

        // notify change - add items
        this.notifyChange({source: 'popup', eventName: 'selectionAdded', options: exclusion});

        // select all matches
        // this.selected.length = 0;
        this.selected.splice(0);
        this.selected = this.selected.concat(this.options);
        this.notifyChange({source: 'popup', eventName: 'selectionUpdated', options: this.selected});
        return true;
    }

    // deselect all
    deselectAll(): boolean {
        // if NONE is selected, return
        if (this.selected.length === 0)
            return false;

        // call this method to handle the selection limits
        // this.active = null;
        // return this.removeSelections(this.selected);

        // notify change - remove all selected items
        this.notifyChange({source: 'popup', eventName: 'selectionRemoved', options: this.selected});
        // reset selection
        // this.selected.length = 0;
        this.selected.splice(0);
        this.active = null;

        // notify update
        this.notifyChange({source: 'popup', eventName: 'selectionUpdated', options: this.selected});
        return true;
    }

    addSelections(options: Array<any>): boolean {
        let changeDetected: boolean = false;
        let limitReached: boolean = false;
        let optionsAdded: Array<any> = [];
        let optionsRemoved: Array<any> = [];
        // multiple mode
        if (this.multiple) {
            options.some((option) => {
                // if not found in model
                if (this.selected.indexOf(option) === -1) {

                    if (this.settings.maxSelection === 0 ||
                        (this.settings.maxSelection && this.selected.length < this.settings.maxSelection)) {
                        changeDetected = true;
                        this.selected.push(option);
                        optionsAdded.push(option);
                    }
                    else {
                        if (this.settings.autoUnselect) {
                            changeDetected = true;
                            // add this one
                            this.selected.push(option);
                            optionsAdded.push(option);
                            // remove the other
                            const removedOption = this.selected.shift();
                            optionsRemoved.push(removedOption);
                        }
                        else {
                            limitReached = true;
                            return true;// break the loop
                        }
                    }
                    return false;
                }
            });
        }
        // single mode
        else if (this.selected.indexOf(options[0]) === -1) {
            // remove current value
            if (this.selected.length > 0) {
                optionsRemoved.push(this.selected[0]);
            }
            // reset and add new value
            // this.selected.length = 0;
            this.selected.splice(0);
            this.selected.push(options[0]);
            optionsAdded.push(options[0]);
            changeDetected = true;
        }
        if (changeDetected) {
            if (optionsRemoved.length > 0) {
                this.notifyChange({source: 'popup', eventName: 'selectionRemoved', options: optionsRemoved});
            }
            if (optionsAdded.length > 0) {
                this.notifyChange({source: 'popup', eventName: 'selectionAdded', options: optionsAdded});
            }
            this.notifyChange({source: 'popup', eventName: 'selectionUpdated', options: this.selected});
        }
        if (limitReached) {
            this.notifyChange({source: 'popup', eventName: 'limitReached', options: this.selected});
        }
        return changeDetected;
    }

    removeSelections(options: Array<any>): boolean {

        let changeDetected: boolean = false;
        if (this.selected.length === 0)
            return changeDetected;

        let optionsRemoved: Array<any> = [];
        // multiple mode
        if (this.multiple) {
            options.forEach((option) => {
                let index: number = this.selected.indexOf(option);
                if (index > -1) {
                    changeDetected = true;
                    optionsRemoved.push(option);
                    this.selected.splice(index, 1);
                }
            });
        }
        // single mode
        else if (this.selected.indexOf(options[0]) === -1) {
            changeDetected = true;
            // this.selected.length = 0;
            this.selected.splice(0);
        }
        if (changeDetected) {
            if (optionsRemoved.length > 0) {
                this.notifyChange({source: 'popup', eventName: 'selectionRemoved', options: optionsRemoved});
            }
            this.notifyChange({source: 'popup', eventName: 'selectionUpdated', options: this.selected});
        }
        return changeDetected;
    }

    // when user pressed Enter to select current active option
    select(selected: any): boolean {
        if (!selected)
            return false;
        if (this.multiple) {
            // this.active = null;
            if (!this.selected || this.selected.length === 0) {
                return this.addSelections([selected]);
            }
            else {
                // in multiple mode, pressing enter on option means toggling selection
                // currently selected -> deselect it
                // currently not selected -> select it
                let index: number = this.selected.indexOf(selected);
                if (index >= 0) {
                    // if found, remove it
                    this.removeSelections([selected]);
                }
                else {
                    // if not found, add it
                    return this.addSelections([selected]);
                }
            }
        }
        // in single mode, enter means selecting
        else {
            this.active = selected;
            return this.addSelections([selected]);
        }
        return false;
    }

    /* move to the previous one, return true if position is changed */
    activatePreviousMatch(oldIndex?: number): boolean {
        if (!this.active || !this.matches || this.matches.length === 0) {
            return false;
        }
        let index: number = this.matches.findIndex((match: MatchedOption)=> match.item === this.active);
        if (!oldIndex)
            oldIndex = index;
        let newIndex: number = index - 1 < 0 ? -1 : index - 1;
        if (newIndex === -1) {
            this.active = null;
            return true;
        }
        this.active = this.matches[newIndex].item;
        if (this.matches[newIndex].isHeader()) {
            return this.activatePreviousMatch(newIndex);
        }
        if (oldIndex !== newIndex) {
            this.notifyChange({source: 'input', eventName: 'activeChanged',options: [this.active]});
        }
        return oldIndex !== newIndex;
    }

    /* move to the next one, return true if position is changed */
    activateNextMatch(oldIndex?: number): boolean {
        let newIndex: number;
        if (!this.active) {
            if (!oldIndex)
                oldIndex = -1;
            newIndex = 0;
        }
        else {
            let index: number = this.matches.findIndex((match: MatchedOption)=> match.item === this.active);
            if (!oldIndex)
                oldIndex = index;
            newIndex = index + 1 > this.matches.length - 1 ? index : index + 1;
        }
        this.active = this.matches[newIndex].item;
        if (this.matches[newIndex].isHeader()) {
            return this.activateNextMatch(newIndex);
        }
        if (oldIndex !== newIndex) {
            this.notifyChange({source: 'input', eventName: 'activeChanged', options: [this.active]});
        }
        return oldIndex !== newIndex;
    }

    /* return true if max selection is reached */
    isLimitReached(option: any): boolean {
        return (this.settings.maxSelection &&
                this.selected.length >= this.settings.maxSelection &&
                this.selected.indexOf(option) === -1);
    }

    /* return the last selected option */
    getLastSelected(): any {
        if (!this.selected || this.selected.length===0)
            return null;
        return this.selected[this.selected.length - 1];
    }

    hasMatches(): boolean {
        return (this.matches && this.matches.length > 0);
    }

    /* generate MatchOptions from options matching searchKeyword */
    generateMatches(force: boolean = false) {
        if (!this._optionService)
            this._optionService = new OptionService(this.settings);

        this.query = null;
        if (this.options && this.options.length > 0) {
            if (force || this.matches.length < this.options.length) {
                this.matches.length = 0;
                // this.matches.splice(0);
                this.matches = this.matches.concat(this._optionService.prepareMatchedOptions(this.options));
            }
        }
        else {
            this.matches.length = 0;
            // this.matches.splice(0);
        }
    }

    subscribeFilterChange(element: HTMLElement): Subscription {
        return Observable.fromEvent(element, 'keyup')
            .filter((event: KeyboardEvent) => isNotControlKey(event.keyCode))
            .map((e: any) => e.target.value)
            .debounceTime(this.settings.waitTime)
            .concat()
            .distinctUntilChanged()
            .filter((query: string) => query && query.length > 0)
            .switchMap((query: string) => this.filterOptions(query))
            .subscribe(
                (matches: any[]) => {
                    // this.matches.length = 0;
                    this.matches.splice(0);
                    this.matches = this.matches.concat(this._optionService.prepareMatchedOptions(matches, this.query));
                },
                (err: any) => {
                    console.error(err);
                }
            )
    }

    filterOptions(searchKeyword: string): Observable<any> {
        if (!searchKeyword || searchKeyword.length === 0) {
            this.query = null;
            return Observable.from(this.options).toArray();
        }
        else {
            this.query = this._optionService.normalizeQuery(searchKeyword);
            return this._optionService.searchOptions(this.options, this.query)
        }
    }

    onDestroy():void {
        // release all object references
        this.options = null;
        this.selected = null;
        this.settings = null;
        this.matches = null;
        // release all template references
        this.itemTemplate = null;
        this.optionsTemplate = null;
    }

    private _hasValue(value): boolean {
        if (!value)
            return false;
        if (typeof value === 'string' || value.constructor===Array)
            return value.length > 0;
        return !!value;
    }
}