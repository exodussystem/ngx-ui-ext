/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 7/1/2017.
 */

import { ElementRef, Input, OnChanges, SimpleChange } from '@angular/core';

export type IconFontType = 'glyphicon' | 'fa';  // current support only Bootstrap Glyphicon and Font Awesome

const SIZE_VALUE_VALIDATOR: RegExp = /[1-5]/;
const FLIP_VALUE_VALIDATOR: RegExp = /['horizontal'|'vertical']/;
const PULL_VALUE_VALIDATOR: RegExp = /['right'|'left']/;
const ROTATE_VALUE_VALIDATOR: RegExp = /[90|180|270]/;

const reverseMap = (forwardMap) => {
    let reverseMap = {};
    for (var key in forwardMap) {
        if (forwardMap.hasOwnProperty(key)) {
            reverseMap[forwardMap[key]] = key;
        }
    }
    return reverseMap;
}

const ICON_MAP_GLYPH_TO_FA =
{
    'chevron-up' : 'chevron-up',
    'chevron-down' : 'chevron-down',
    'chevron-right' : 'chevron-right',
    'chevron-left' : 'chevron-left',
    'asterisk' : 'asterisk',
    'plus' : 'plus',
    'euro' : 'eur',
    'eur' : 'eur',
    'minus' : 'minus',
    'cloud' : 'cloud',
    'envelope' : 'envelope',
    'pencil' : 'pencil',
    'glass' : 'glass',
    'music' : 'music',
    'search' : 'search',
    'heart' : 'heart',
    'star' : 'star',
    'star-empty' : 'star-o',
    'user' : 'user',
    'film' : 'film',
    'th-large' : 'th-large',
    'th' : 'th',
    'th-list' : 'th-list',
    'ok' : 'check',
    'remove' : 'remove',
    'zoom-in' : 'search-plus',
    'zoom-out' : 'search-minus',
    'off' : 'power-off',
    'signal' : 'signal',
    'cog' : 'cog',
    'trash' : 'trash',
    'home' : 'home',
    'file' : 'file',
    'time' : 'clock-o',
    'road' : 'road',
    'download-alt' : 'cloud-download',
    'download' : 'download',
    'upload' : 'upload',
    'inbox' : 'inbox',
    'play-circle' : 'play-circle',
    'repeat' : 'repeat',
    'refresh' : 'refresh',
    'list-alt' : 'list-alt',
    'lock' : 'lock',
    'flag' : 'flag',
    'headphones' : 'headphones',
    'volume-off' : 'volume-off',
    'volume-down' : 'volume-down',
    'volume-up' : 'volume-up',
    'qrcode' : 'qrcode',
    'barcode' : 'barcode',
    'tag' : 'tag',
    'tags' : 'tags',
    'book' : 'book',
    'bookmark' : 'bookmark',
    'print' : 'print',
    'camera' : 'camera',
    'font' : 'font',
    'bold' : 'bold',
    'italic' : 'italic',
    'text-height' : 'text-height',
    'text-width' : 'text-width',
    'align-left' : 'align-left',
    'align-center' : 'align-center',
    'align-right' : 'align-right',
    'align-justify' : 'align-justify',
    'list' : 'list',
    'indent-left' : 'indent',
    'indent-right' : 'outdent',
    'facetime-video' : 'video-camera',
    'picture' : 'picture-o',
    'map-marker' : 'map-marker',
    'adjust' : 'adjust',
    'tint' : 'tint',
    'edit' : 'edit',
    'share' : 'share',
    'check' : 'check',
    'move' : 'arrows',
    'step-backward' : 'step-backward',
    'fast-backward' : 'fast-backward',
    'backward' : 'backward',
    'play' : 'play',
    'pause' : 'pause',
    'stop' : 'stop',
    'forward' : 'forward',
    'fast-forward' : 'fast-forward',
    'step-forward' : 'step-forward',
    'eject' : 'eject',
    'plus-sign' : 'plus-circle',
    'minus-sign' : 'minus-circle',
    'remove-sign' : 'times-circle',
    'ok-sign' : 'check-circle',
    'question-sign' : 'question-circle',
    'question' : 'question-circle-o',
    'info-sign' : 'info-circle',
    'screenshot' : 'crosshairs',
    'remove-circle' : 'times-circle',
    'ok-circle' : 'check-circle',
    'ban-circle' : 'ban',
    'arrow-left' : 'arrow-left',
    'arrow-right' : 'arrow-right',
    'arrow-up' : 'arrow-up',
    'arrow-down' : 'arrow-down',
    'share-alt' : 'share-alt',
    'resize-full' : 'expand',
    'resize-small' : 'compress',
    'exclamation-sign' : 'exclamation-circle',
    'gift' : 'gift',
    'leaf' : 'leaf',
    'fire' : 'fire',
    'eye-open' : 'eye',
    'eye-close' : 'eye-slash',
    'warning-sign' : 'exclamation-triangle',
    'plane' : 'plane',
    'calendar' : 'calendar',
    'random' : 'random',
    'comment' : 'comment',
    'magnet' : 'magnet',
    'retweet' : 'retweet',
    'shopping-cart' : 'shopping-cart',
    'folder-close' : 'folder',
    'folder-open' : 'folder-open',
    'resize-vertical' : 'arrows-v',
    'resize-horizontal' : 'arrows-h',
    'hdd' : 'hdd-o',
    'bullhorn' : 'bullhorn',
    'bell' : 'bell',
    'certificate' : 'certificate',
    'thumbs-up' : 'thumbs-up',
    'thumbs-down' : 'thumbs-down',
    'hand-right' : 'hand-o-right',
    'hand-left' : 'hand-o-left',
    'hand-up' : 'hand-o-up',
    'hand-down' : 'hand-o-down',
    'circle-arrow-right' : 'arrow-circle-right',
    'circle-arrow-left' : 'arrow-circle-left',
    'circle-arrow-up' : 'arrow-circle-up',
    'circle-arrow-down' : 'arrow-circle-down',
    'globe' : 'globe',
    'wrench' : 'wrench',
    'tasks' : 'tasks',
    'filter' : 'filter',
    'briefcase' : 'briefcase',
    'fullscreen' : 'expand',
    'dashboard' : 'dashboard',
    'paperclip' : 'paperclip',
    'heart-empty' : 'heart-o',
    'link' : 'link',
    'phone' : 'phone',
    'pushpin' : 'thumb-tack',
    'usd' : 'usd',
    'gbp' : 'gbp',
    'sort' : 'sort',
    'sort-by-alphabet' : 'sort-alpha-asc',
    'sort-by-alphabet-alt' : 'sort-alpha-desc',
    'sort-by-order' : 'sort-numeric-asc',
    'sort-by-order-alt' : 'sort-numeric-desc',
    'sort-by-attributes' : 'sort-amount-asc',
    'sort-by-attributes-alt' : 'sort-amount-desc',
    'unchecked' : 'square-o',
    'expand' : 'caret-square-o-right',
    'collapse-down' : 'caret-square-o-down',
    'collapse-up' : 'caret-square-o-up',
    'log-in' : 'sign-in',
    'flash' : 'flash',
    'log-out' : 'sign-out',
    'new-window' : 'external-link',
    'record' : 'dot-circle-o',
    'save' : 'save',
    'open' : 'upload',
    'saved' : 'check',
    'import' : 'upload',
    'export' : 'download',
    'send' : 'paper-plane-o',
    'floppy-disk' : 'save',
    'floppy-saved' : 'check',
    'floppy-remove' : 'remove',
    'floppy-save' : 'download',
    'floppy-open' : 'upload',
    'credit-card' : 'credit-card',
    'transfer' : 'exchange',
    'cutlery' : 'cutlery',
    'header' : 'header',
    'compressed' : 'file-archive-o',
    'earphone' : 'phone',
    'phone-alt' : 'phone-square',
    'tower' : 'building',
    'stats' : 'bar-chart',
    'sd-video' : 'film',
    'hd-video' : 'film',
    'subtitles' : 'cc',
    'sound-stereo' : 'music',
    'sound-dolby' : 'music',
    'sound-5-1' : 'music',
    'sound-6-1' : 'music',
    'sound-7-1' : 'music',
    'copyright-mark' : 'copyright',
    'registration-mark' : 'registered',
    'cloud-download' : 'cloud-download',
    'cloud-upload' : 'cloud-upload',
    'tree-conifer' : 'tree',
    'tree-deciduous' : 'tree',
    'cd' : 'dot-circle-o',
    'save-file' : 'save',
    'open-file' : 'folder-open-o',
    'level-up' : 'level-up',
    'copy' : 'copy',
    'paste' : 'paste',
    'alert' : 'exclamation-triangle',
    'equalizer' : 'bar-chart',
    'king' : 'question',
    'queen' : 'question',
    'pawn' : 'question',
    'bishop' : 'question',
    'knight' : 'question',
    'baby-formula' : 'question',
    'tent' : 'question',
    'blackboard' : 'question',
    'bed' : 'bed',
    'apple' : 'apple',
    'erase' : 'eraser',
    'hourglass' : 'hourglass',
    'lamp' : 'lightbulb-o',
    'duplicate' : 'files-o',
    'piggy-bank' : 'money',
    'scissors' : 'scissors',
    'bitcoin' : 'bitcoin',
    'btc' : 'btc',
    'xbt' : 'btc',
    'yen' : 'yen',
    'jpy' : 'jpy',
    'ruble' : 'ruble',
    'rub' : 'rub',
    'scale' : 'balance-scale',
    'ice-lolly' : 'question',
    'ice-lolly-tasted' : 'question',
    'education' : 'graduation-cap',
    'option-horizontal' : 'ellipsis-h',
    'option-vertical' : 'ellipsis-v',
    'menu-hamburger' : 'bars',
    'modal-window' : 'question',
    'oil' : 'question',
    'grain' : 'question',
    'sunglasses' : 'question',
    'text-size' : 'font',
    'text-color' : 'font',
    'text-background' : 'font',
    'object-align-top' : 'question',
    'object-align-bottom' : 'question',
    'object-align-horizontal' : 'question',
    'object-align-left' : 'question',
    'object-align-vertical' : 'question',
    'object-align-right' : 'question',
    'triangle-right' : 'caret-right',
    'triangle-left' : 'caret-left',
    'triangle-bottom' : 'caret-down',
    'triangle-top' : 'caret-up',
    'console' : 'terminal',
    'superscript' : 'superscript',
    'subscript' : 'subscript',
    'menu-left' : 'chevron-left',
    'menu-right' : 'chevron-right',
    'menu-down' : 'chevron-down',
    'menu-up' : 'chevron-up',
};
const ICON_MAP_FA_TO_GLYPH =  reverseMap(ICON_MAP_GLYPH_TO_FA);

export class UiIcon implements OnChanges {
    @Input() fontType: IconFontType; // font type 'fa'/'glyphicon'
    @Input() name: string; // fa-'name'/glyphicon-'name'
    @Input() alt: string; // Currently not supported yet
    @Input() size: string|number; // [lg|2-5] -> fa-[lg|2-5]x
    @Input() stack: number; // [1-2] -> fa-stack-[1|2]x
    @Input() flip: string; // [horizontal|vertical] -> fa-flip-[horizontal|vertical]
    @Input() pull: string; // [right|left] -> fa-pull-[right|left]
    @Input() rotate: number; // [90|180|270] -> fa-rotate-[90|180|270]
    @Input() border: boolean; // true -> fa-border
    @Input() spin: boolean; // true -> fa-spin
    @Input() fixedWidth: boolean; // true -> fa-fw
    @Input() inverse: boolean; // true -> fa-inverse

    protected el: HTMLElement;

    constructor(fontType: IconFontType = 'glyphicon', el: ElementRef) {

        this.el = el.nativeElement;
        this.fontType = fontType;
        this.addIconClass(fontType);
    }

    ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {

        for (let key in changes) {
            let previousValue = changes[key].previousValue;
            let currentValue = changes[key].currentValue;

            switch (key) {
                case 'name':
                    let iconName: string = <string>currentValue;
                    if (this.fontType === 'glyphicon') {
                        iconName = ICON_MAP_FA_TO_GLYPH[currentValue];
                    }
                    else if (this.fontType === 'fa') {
                        iconName = ICON_MAP_GLYPH_TO_FA[currentValue];
                    }
                    if (iconName !== currentValue)
                        currentValue = iconName;

                    if (typeof previousValue === 'string') {
                        this.removeIconClass(this.fontType + `-${previousValue}`);
                    }
                    this.addIconClass(this.fontType + `-${currentValue}`);
                    break;

                case 'alt':
                    // TODO(Write code for the alt parameter)
                    break;

                case 'size':
                    if (SIZE_VALUE_VALIDATOR.test(currentValue)) {
                        if (previousValue === 1) {
                            this.removeIconClass(this.fontType + '-lg');
                        } else if (typeof previousValue === 'string') {
                            this.removeIconClass(this.fontType + `-${previousValue}x`);
                        }
                        if (currentValue === 1) {
                            this.addIconClass(this.fontType + '-lg');
                        } else {
                            this.addIconClass(this.fontType + `-${currentValue}x`);
                        }
                    }
                    break;

                case 'stack':
                    if (SIZE_VALUE_VALIDATOR.test(currentValue)) {
                        if (typeof previousValue === 'string') {
                            this.removeIconClass(this.fontType + `-stack-${previousValue}x`);
                        }
                        this.addIconClass(this.fontType + `-stack-${currentValue}x`);
                    }
                    break;

                case 'flip':
                    if (FLIP_VALUE_VALIDATOR.test(currentValue)) {
                        if (typeof previousValue === 'string') {
                            this.removeIconClass(this.fontType + `-flip-${previousValue}`);
                        }
                        this.addIconClass(this.fontType + `-flip-${currentValue}`);
                    }
                    break;

                case 'pull':
                    // Only support FontAwesome
                    if (this.fontType !== 'fa')
                        break;

                    if (PULL_VALUE_VALIDATOR.test(currentValue)) {
                        if (typeof previousValue === 'string') {
                            this.removeIconClass(this.fontType + `-pull-${previousValue}`);
                        }
                        this.addIconClass(this.fontType + `-pull-${currentValue}`);
                    }
                    break;

                case 'rotate':
                    if (ROTATE_VALUE_VALIDATOR.test(currentValue)) {
                        if (typeof previousValue === 'string') {
                            this.removeIconClass(this.fontType + `-rotate-${previousValue}`);
                        }
                        this.addIconClass(this.fontType + `-rotate-${currentValue}`);
                    }
                    break;

                case 'border':
                    // Only support FontAwesome
                    if (this.fontType !== 'fa')
                        break;

                    if (currentValue) {
                        this.addIconClass('fa-border');
                    } else if (typeof previousValue === 'string') {
                        this.removeIconClass('fa-border');
                    }
                    break;

                case 'spin':
                    if (currentValue) {
                        this.addIconClass(this.fontType + `-spin`);
                    } else if (typeof previousValue === 'string') {
                        this.removeIconClass(this.fontType + `-spin`);
                    }
                    break;

                case 'fixedWidth':
                    if (currentValue) {
                        this.addIconClass(this.fontType + '-fw');
                    } else if (typeof previousValue === 'string') {
                        this.removeIconClass(this.fontType + '-fw');
                    }
                    break;

                case 'inverse':
                    // Only support FontAwesome
                    if (this.fontType !== 'fa')
                        break;
                    if (currentValue) {
                        this.addIconClass('fa-inverse');
                    } else if (typeof previousValue === 'string') {
                        this.removeIconClass('fa-inverse');
                    }
                    break;
            }
        }
    }

    public addIconClass(className: string) {
        // empty implementation. Must be overriden in subclass
    }

    public removeIconClass(className: string) {
        // empty implementation. Must be overriden in subclass
    }

}