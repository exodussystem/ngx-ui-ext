/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/11/2017.
 */

import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { IMaskConfig, InputMaskService } from './input-mask.service';
import { InputMaskState } from './input-mask-state';
import { ValueAccessorProviderFactory } from '../datepicker/selectors/common/common';

@Directive({
    host: {
        '(input)': 'onInput($event.target.value)',
        '(blur)': '_onTouched()'
    },
    selector: '[textMask]',
    providers: [ValueAccessorProviderFactory(UiMaskedInputDirective)]
})
export class UiMaskedInputDirective implements ControlValueAccessor, OnChanges {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _inputState: InputMaskState = new InputMaskState();
    private _inputElement: HTMLInputElement;

    private _defaultConfig: IMaskConfig = {
        mask: [],
        guide: true,
        placeholderChar: '_',
        keepCharPositions: false,
    }

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input('textMask')
    set textMask(value: IMaskConfig) {
        this._inputState.config = Object.assign({}, this._defaultConfig, value || {});
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _element: ElementRef,
                private _inputMaskService: InputMaskService,
                private _renderer: Renderer2) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    // implements OnChanges
    ngOnChanges(changes: SimpleChanges) {
        this.setupMask()
        this._inputMaskService.update(
            this._inputElement.value,
            this._inputElement,
            this._inputState
        );
    }

    //
    // implements ControlValueAccessor
    //

    _onTouched = () => {
    }
    _onChange = (_: any) => {
    }

    writeValue(value: any) {
        if (!this._inputElement) {
            this.setupMask();
        }

        // set the initial value for cases where the mask is disabled
        const normalizedValue = value == null ? '' : value;
        this._renderer.setValue(this._inputElement, normalizedValue);

        this._onValueChange(value);
    }

    registerOnChange(fn: (value: any) => any): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => any): void {
        this._onTouched = fn;
    }

    setDisabledState(isDisabled: boolean) {
        this._renderer.setProperty(this._element.nativeElement, 'disabled', isDisabled);
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    onInput(value) {
        if (!this._inputElement) {
            this.setupMask();
        }
        // check against the last value to prevent firing ngModelChange despite no changes
        if (this._onValueChange(value)) {
            this._onChange(value);
        }
    }

    private setupMask() {
        if (this._element.nativeElement.tagName === 'INPUT') {
            // `textMask` directive is used directly on an input element
            this._inputElement = this._element.nativeElement;
        } else {
            // `textMask` directive is used on an abstracted input element, `ion-input`, `md-input`, etc
            this._inputElement = this._element.nativeElement.getElementsByTagName('INPUT')[0];
        }
    }

    private _onValueChange(value): boolean {
        this._inputState = this._inputMaskService.update(value, this._inputElement, this._inputState);

        // In some cases, this `update` method will be repeatedly called with a raw value that has already been conformed
        // and set to `inputElement.value`. The below check guards against needlessly readjusting the input this.
        // See https://github.com/text-mask/text-mask/issues/231
        if (this._inputState.lastValue === this._inputState.previousConformedValue) {
            return false;
        }

        // set the input value
        this._inputElement.value = this._inputState.previousConformedValue;
        if (document.activeElement === this._inputElement) {
            // adjust caret position
            this._inputElement.setSelectionRange(this._inputState.caretPosition,
                                                 this._inputState.caretPosition, 'none');
        }
        return true;
    }
}