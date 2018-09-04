/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 7/29/2017.
 */

export class MatchedOption {
    public readonly value: string;
    public readonly display: string;
    public readonly item: any;
    public readonly header: boolean;

    public constructor(item: any, value: string = item, display: string = value, header: boolean = false) {
        this.item = item;
        this.value = value;
        this.display = display;
        this.header = header;
    }

    public isHeader(): boolean {
        return this.header;
    }

    public toString(): string {
        return this.value;
    }
}

export interface IOptionSettings {
    /** minimal no of characters that needs to be entered before typeahead kicks-in.
     * When set to 0, typeahead shows on focus with full list of options
     * (limited as normal by typeaheadOptionsLimit) */
    minLength?: number;

    /** minimal wait time after last character typed before  kicks-in */
    waitTime?: number;

    /** maximum length of options items list */
    optionsLimit?: number;

    /** when options source is an array of objects,
     * the name of field that contains the options value,
     * we use array item as option in case of this field is missing.
     * Supports nested properties and methods. */
    optionValueField?: string;  // etc 'value' as attribute/ 'getValue()' as function

    /** when options source is an array of objects,
    * the name of field that contains the options value to display,
    * we use array item as option in case of this field is missing.
    * Supports nested properties and methods. */
    optionDisplayField?: string;// etc 'text' as attribute/ 'getText()' as function

    /** when options source is an array of objects,
     * the name of field that contains the options value to filter/search,
     * Default is display value if not specified
     * Supports nested properties and methods. */
    optionSearchField?: string;// etc 'text' as attribute/ 'getText()' as function

    /** when options source is an array of objects,
     * the name of field that contains the group value,
     * matches are grouped by this field when set.
     * Supports nested properties and methods. */
    groupField?: string;

    /** match latin symbols. If true the word súper would match super and vice versa. */
    matchLatin?: boolean;

    /** break words with spaces.
     * If true the text "exact phrase" match would match with ['match exact phrase here']
     * but not with ['phrase here exact match'] (kind of "google style"). */
    singleWords?: boolean;

    /** should be used only in case singleWords attribute is true.
     * Sets the word delimiter to break words. Defaults to space. */
    wordDelimiters?: string;

    /** should be used only in case singleWords attribute is true.
     * Sets the word delimiter to match exact phrase.
     * Defaults to simple and double quotes. */
    phraseDelimiters?: string;
}

export const DEFAULT_OPTION_SETTINGS: IOptionSettings = {
    optionsLimit: 0,
    minLength: 1,
    waitTime: 250,
    matchLatin: true,
    singleWords:true,
    wordDelimiters: ' ',
    phraseDelimiters: '\'"'
};