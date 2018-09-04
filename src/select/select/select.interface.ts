/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 3/27/2017.
 */

import { IOptionSettings } from '../option/option.interface';

export interface ISelectSettings extends IOptionSettings { //ITypeaheadSettings
    bodyContainer?: boolean;        // true if attaching to body element
    placement?: string;             // position of popup (default is 'bottom left')
    animation?: boolean;            // show animation when collapsing/expanding

    width?: string;                 // popup width ('auto'|'fit'|'200px'...)
    maxHeight?: string;             // maximum height of the popup
    enableSearch?: boolean;         // allow user to search/filter selections
    allowClear?: boolean;           // allow user to reset/clear selection

    buttonClass?: string;           // CSS class for select button
    itemClass?: string;             // CSS class for option item
    popupClass?: string;            // CSS class for popup container

    //
    // MULTIPLE MODE
    //
    checkedIcon?: string;           // if null, then browser checkbox will be used.
                                    // Otherwise, icon with given name of font-awesome or glyph-icon will be used

    maxSelection?: number;          // maximum allowed selections
    minSelection?: number;          // maximum allowed selections

    autoUnselect?: boolean;         // if maximum selections have been reached,
                                    // control automatically removes the previously selection and add the new one

    closeOnSelect?: boolean;        // close the popup after user select/deselect

    showCheckAll?: boolean;         // show check-all control
    checkAllText?: string;          // text label of check-all control

    showUncheckAll?: boolean;       // show uncheck-all control
    uncheckAllText?: string;        // text label of uncheck-all control

    dynamicTitleMaxItems?: number;  // maximum selections to display as button title (0 means no limit)
    showAllSelectedText?: boolean;  // true to display all-selected text label

    checkedSingularText?: string;   // text label when one is selected
    checkedPluralText?: string;     // text label when more than one are selected
    searchPlaceholder?: string;     // placeholder text
    allSelectedText?: string;       // text label to display when all are selected
}

export const DEFAULT_SELECT_SETTINGS: ISelectSettings = {
    bodyContainer: false,
    animation: true,
    enableSearch: false,
    allowClear: true,
    closeOnSelect: false,
    checkedIcon: 'check',           // 'check' for glyphicon-check/fa-check
    placement: 'bottom left',       // 'top right'...
                                    // Add 'auto' to enable auto placement. Only works with bodyContainer is true
    buttonClass: 'btn-default',     // btn-success/btn-info/btn-warning/btn-danger
    width: 'auto',
    maxHeight: '300px',

    //
    // MULTIPLE MODE
    //

    dynamicTitleMaxItems: 3,
    maxSelection: 0,                // 0 means no limit
    minSelection: 0,                // 0 means no limit
    autoUnselect: false,

    showCheckAll: false,
    checkAllText: 'Check All',

    showUncheckAll: false,
    uncheckAllText: 'Uncheck All',

    showAllSelectedText: true,
    allSelectedText: 'All Selected',

    checkedSingularText: 'item selected',
    checkedPluralText: 'items selected',
    searchPlaceholder: 'Search...',
};