import { IOptionSettings, DEFAULT_OPTION_SETTINGS } from '../option/option.interface';

export interface ITypeaheadSettings extends IOptionSettings {
    bodyContainer?: boolean;    // true if attaching to body element
    placement?: string;         // position of popup (default is 'bottom left')
    animation?: boolean;        // show animation when collapsing/expanding
    itemClass?: string;         // CSS class for option item
    popupClass?: string;        // CSS class for popup container
}

export const DEFAULT_TYPEAHEAD_SETTINGS: ITypeaheadSettings =
    Object.assign({}, DEFAULT_OPTION_SETTINGS, {
                        optionsLimit: 20,
                        bodyContainer: true,
                        placement: 'bottom left',
                        animation: false
                    });