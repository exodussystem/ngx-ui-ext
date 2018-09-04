/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 7/28/2017.
 */

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/from';
import { IOptionSettings, MatchedOption } from './option.interface';
import { PropertyUtils } from '../../common/utils/prop-utils';
import { CharUtils } from '../../common/utils/char-utils';

export class OptionService {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _settings: IOptionSettings;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(options: IOptionSettings) {
        this._settings = options;
        // if the option is object
        if (this._settings.optionValueField) {
            if (!this._settings.optionDisplayField)
                this._settings.optionDisplayField = this._settings.optionValueField;
            if (!this._settings.optionSearchField)
                this._settings.optionSearchField = this._settings.optionDisplayField;
        }
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    normalizeQuery(value: string): string|Array<string> {
        // If singleWords, break model here to not be doing extra work on each iteration
        let normalizedQuery: any = (this._settings.matchLatin ? CharUtils.latinize(value) : value).toString().toLowerCase();
        normalizedQuery = this._settings.singleWords
            ? this._tokenize(normalizedQuery, this._settings.wordDelimiters, this._settings.phraseDelimiters)
            : normalizedQuery;

        return normalizedQuery;
    }

    searchOptions(options: any, normalizeQuery?: string|Array<string>): Observable<any> {

        return Observable.from(options)
            .filter((option: any) => {
                return option && this._testMatch(this._normalizeOption(option), normalizeQuery);
            })
            .toArray();
    }

    prepareMatchedOptions(options: any[], normalizeQuery?: string|Array<string>): MatchedOption[] {
        let limited: any[] = this._settings.optionsLimit ? options.slice(0, this._settings.optionsLimit) : options;

        if (this._settings.groupField) {
            let matches: MatchedOption[] = [];

            // extract all group names
            let groups = limited
                .map((option: any) => PropertyUtils.getValueFromObject(option, this._settings.groupField))
                .filter((v: string, i: number, a: any[]) => a.indexOf(v) === i);

            groups.forEach((group: string) => {
                // add group header to array of matches
                matches.push(new MatchedOption(group, group, group, true));

                // add each item of group to array of matches
                matches = matches.concat(limited
                    .filter((option: any) => PropertyUtils.getValueFromObject(option, this._settings.groupField) === group)
                    .map((option: any) => this._getMatchedOption(option, normalizeQuery)));
            });

            return matches;
        }
        else {
            return limited.map((option: any) => this._getMatchedOption(option, normalizeQuery));
        }
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private _getMatchedOption(option: any, normalizeQuery?: string|Array<string>): MatchedOption {
        let value: string = PropertyUtils.getValueFromObject(option, this._settings.optionValueField);
        let display: string = PropertyUtils.getValueFromObject(option, this._settings.optionDisplayField);
        if (normalizeQuery && normalizeQuery.length > 0)
            return new MatchedOption(option, value, this._hightlight(display, normalizeQuery));
        else
            return new MatchedOption(option, value, display);
    }

    private _hightlight(value: string, query: string|Array<string>): string {
        let displayText: string = (this._settings.matchLatin ? CharUtils.latinize(value) : value);
        // Replaces the capture string with the same string inside of a "strong" tag
        if (query && query.constructor === Array) {
            let queryText: string = (<Array<string>>query).join('|');
            displayText = displayText.replace(new RegExp(queryText, 'ig'), '<strong>$&</strong>');
        }
        else if (query) {
            let queryText: string = <string>query;
            displayText = displayText.replace(new RegExp(queryText, 'ig'), '<strong>$&</strong>');
        }
        return displayText;
    }

    private _normalizeOption(option: any): string {
        let optionValue: string = PropertyUtils.getValueFromObject(option, this._settings.optionSearchField);
        let normalizedOption = this._settings.matchLatin ? CharUtils.latinize(optionValue) : optionValue;
        return normalizedOption.toLowerCase();
    }

    private _testMatch(match: string, test: any): boolean {

        if (typeof test === 'object') {
            for (let i = 0; i <  test.length; i += 1) {
                if (test[i].length > 0 && match.indexOf(test[i]) < 0) {
                    return false;
                }
            }
            return true;
        }
        return match.indexOf(test) >= 0;
    }

    private _tokenize(str: string, wordRegexDelimiters = ' ', phraseRegexDelimiters = ''): Array<string> {
        /* tslint:enable */
        let regexStr: string = '(?:[' + phraseRegexDelimiters + '])([^' + phraseRegexDelimiters + ']+)' +
                                '(?:[' + phraseRegexDelimiters + '])|([^' + wordRegexDelimiters + ']+)';
        let preTokenized: string[] = str.split(new RegExp(regexStr, 'g'));
        let result: string[] = [];
        let preTokenizedLength: number = preTokenized.length;
        let token: string;
        let replacePhraseDelimiters = new RegExp('[' + phraseRegexDelimiters + ']+', 'g');

        for (let i = 0; i < preTokenizedLength; i += 1) {
            token = preTokenized[i];
            if (token && token.length && token !== wordRegexDelimiters) {
                result.push(token.replace(replacePhraseDelimiters, ''));
            }
        }

        return result;
    }
}