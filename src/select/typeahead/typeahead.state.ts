/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/26/2017.
 */

import { Injectable, TemplateRef } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';
import { MatchedOption } from '../option/option.interface';
import { ISelectSettings } from '../select/select.interface';
import { OptionService } from '../option/option.service';
import { isNotControlKey, PropertyUtils } from '../../common/utils';
import { ITypeaheadSettings, DEFAULT_TYPEAHEAD_SETTINGS } from './typeahead.interface';

export interface ITypeaheadEvent {
    // event name : 'selectChanged'|'activeChanged'|'matchesChanged';
    eventName: string;

    // will store active value, selected value or query string
    value?: string|Array<string>;
}

@Injectable()
export class UiTypeaheadState {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    // settings
    public settings: ITypeaheadSettings = Object.assign({}, DEFAULT_TYPEAHEAD_SETTINGS);
    // templates
    public itemTemplate: TemplateRef<any>;
    public optionsTemplate: TemplateRef<any>;

    public keyword: string;             // (raw) text input value
    public query: string|Array<string>; // (normalized) query string or list of query string
    public active: any;                 // active option (having focus)
    public options: Array<any>;         // original options
    public selected: any;               // selected options (subsest of matches)
    public matches: Array<MatchedOption> = [];// results from filtering options with search keyword

    private _optionService: OptionService;

    // Observable sources
    private _stateChangeSource: Subject<ITypeaheadEvent> = new Subject<ITypeaheadEvent>();

    // Observable streams
    public stateChange$: Observable<ITypeaheadEvent> = this._stateChangeSource.asObservable();

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    // notify change
    notifyChange(change: ITypeaheadEvent): void {
        this._stateChangeSource.next(change);
    }

    setSettings(value: ISelectSettings) {
        this.settings = Object.assign({}, DEFAULT_TYPEAHEAD_SETTINGS, value);
        this._optionService = new OptionService(this.settings);
    }

    setOptions(value: Array<any>) {
        this.options = value;
    }

    reset() {
        this.selected = null;
        this.active = null;
        this.matches = [];
        this.keyword = '';
        this.query = null;
    }

    // when user pressed Enter to select current active option
    select(option: any): boolean {
        let optionValue: string = this.getOptionValue(option);
        let selectedValue: string = this.getOptionValue(this.selected);
        if (option && optionValue && (!this.selected || selectedValue !== optionValue)) {
            this.active = option;
            this.selected = option;
            this.query = optionValue;
            this.keyword = optionValue;
            this.notifyChange({eventName: 'selectChanged', value: optionValue});

            return true;
        }
        return false;
    }

    /* move to the previous one, return true if position is changed */
    activatePreviousMatch(oldIndex?: number): boolean {
        let newIndex: number;
        if (!this.active) {
            if (!oldIndex)
                oldIndex = -1;
            newIndex = this.matches.length - 1;
        }
        else {
            let index: number = this.matches.findIndex((match: MatchedOption)=> match.item === this.active);
            if (!oldIndex)
                oldIndex = index;
            newIndex = index - 1 < 0 ? - 1 : index - 1;
        }
        if (newIndex === -1) {
            this.active = null;
            return true;
        }
        this.active = this.matches[newIndex].item;
        if (this.matches[newIndex].isHeader()) {
            return this.activatePreviousMatch(oldIndex);
        }
        if (oldIndex !== newIndex) {
            this.onActiveChanged();
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
            newIndex = index + 1 > this.matches.length - 1 ? -1 : index + 1;
        }
        if (newIndex === -1) {
            this.active = null;
            return true;
        }
        this.active = this.matches[newIndex].item;
        if (this.matches[newIndex].isHeader()) {
            return this.activateNextMatch(oldIndex);
        }

        if (oldIndex !== newIndex) {
            this.onActiveChanged();
        }
        return oldIndex !== newIndex;
    }

    /* generate MatchOptions from options matching searchKeyword */
    generateMatches(newValue: string, silent: boolean = false) {

        if (!this._optionService)
            this._optionService = new OptionService(this.settings);

        //options are not available
        if (!this.options) {
            console.error('Options are not available. Make sure to preload them')
            return;
        }

        this.keyword = newValue;

        // search again
        this.filterOptions(newValue)
            .subscribe(
                (matches: any[]) => {

                    this.matches.splice(0);
                    this.matches = this.matches.concat(this._optionService.prepareMatchedOptions(matches, this.query));
                    if (this.matches && this.matches.length > 0) {
                        this.selected = this.matches[0];
                        this.active = this.matches[0];
                    }
                    if (!silent)
                        this.notifyChange({eventName: 'matchesChanged', value: 'finished'});
                },
                (err: any) => {
                    console.error(err);
                }
            );
    }

    subscribeFilterChange(element: HTMLElement): Subscription {
        return Observable.fromEvent(element, 'keyup')
            .filter((event: KeyboardEvent) => isNotControlKey(event.keyCode))
            .map((e: any) => e.target.value)
            .debounceTime(this.settings.waitTime)
            .concat()
            .distinctUntilChanged()
            .filter((query: string) => {
                this.keyword = query;
                return query.length >= this.settings.minLength;
            })
            .switchMap((query: string) => this.filterOptions(query))
            .subscribe(
                (matches: any[]) => {
                    this.selected = null;
                    this.active = null;
                    this.matches.splice(0);
                    this.matches = this.matches.concat(this._optionService.prepareMatchedOptions(matches, this.query));
                    this.notifyChange({eventName: 'matchesChanged', value: 'finished'});
                },
                (err: any) => {
                    console.error(err);
                }
            )
    }

    filterOptions(searchKeyword: string, silent: boolean = false): Observable<any> {
        if (!this._optionService)
            this._optionService = new OptionService(this.settings);

        if (!searchKeyword || searchKeyword.length === 0) {
            this.query = null;
            return Observable.from([]).toArray();
        }
        else {
            if (!silent)
                this.notifyChange({eventName: 'matchesChanged', value: 'start'});

            this.query = this._optionService.normalizeQuery(searchKeyword);
            return this._optionService.searchOptions(this.options, this.query)
        }
    }

    onActiveChanged() {
        // if active is not empty, focus is on active option
        // then set value of the active option in the input text
        // otherwise, focus is back to the input
        // show entered keyword in the input text
        this.notifyChange({
            eventName: 'activeChanged',
            value: this.active ? this.getOptionValue(this.active) : this.keyword
        });
    }

    onDestroy():void {
        // release all object references
        this.options = null;
        this.selected = null;
        this.active = null;
        this.settings = null;
        this.matches = null;
        // release all template references
        this.itemTemplate = null;
        this.optionsTemplate = null;
    }

    getOptionValue(option: any): string {
        return PropertyUtils.getValueFromObject(option, this.settings.optionDisplayField);
    }
}