import { Directive, ElementRef, Input } from "@angular/core";
import { NgModel } from "@angular/forms";

export type CustomMaskConfig = {initialValue: string; currentCaretPosition: number};
export type CustomMaskResult = {maskedValue: string; newCaretPosition?: number};
export type CustomMask = (config: CustomMaskConfig) => CustomMaskResult;

export enum Mask {
    LettersOnly,
    NumbersOnly,
    Alphanumeric,
    Regex,
    Custom
}

export interface ITextMaskConfig {
    type: Mask;
    regex?: any;
    custom?: CustomMask;
}

@Directive({
    selector: 'input[textMask]',
    host: {
        '(input)': 'onInput()'
    }
})
export class UiMaskedInputDirective {

    private inputElement: HTMLInputElement;

    @Input('textMask')
    textMaskConfig: ITextMaskConfig;

    constructor(inputElement: ElementRef, private ngModel: NgModel) {
        this.inputElement = inputElement.nativeElement
    }

    ngOnInit() {
        if (!this.textMaskConfig)
            return;
        setTimeout(() => this.onInput());
    }

    onInput() {
        if (!this.textMaskConfig)
            return;
        let initialValue = this.inputElement.value;
        let caretPosition = this.inputElement.selectionStart;

        let mask: CustomMask;

        let regexMaskFactory = (regex: any): CustomMask => {
            let c: CustomMask = (config: CustomMaskConfig) => {
                let replace = (s: string) => s.replace(new RegExp(regex, 'g'), '');
                let textBeforeCaret = initialValue.slice(0, config.currentCaretPosition);
                let maskedValue = replace(config.initialValue);
                let newCaretPosition = replace(textBeforeCaret).length;

                let result: CustomMaskResult = {
                    maskedValue: maskedValue,
                    newCaretPosition: newCaretPosition
                };

                return result;
            };

            return c;
        };

        switch (this.textMaskConfig.type) {
            case Mask.LettersOnly:
                mask = regexMaskFactory('[^a-zA-Z]');
                break;
            case Mask.NumbersOnly:
                mask = regexMaskFactory('[^0-9.\\-]');
                break;
            case Mask.Alphanumeric:
                mask = regexMaskFactory('[^a-zA-Z0-9.\\-]');
                break;
            case Mask.Regex:
                if (!this.textMaskConfig.regex) {
                    mask = null;
                    break;
                }
                mask = regexMaskFactory(this.textMaskConfig.regex);
                break;
            case Mask.Custom:
                if (!this.textMaskConfig.custom) {
                    mask = null;
                    break;
                }
                mask = this.textMaskConfig.custom;
                break;
            default:
                mask = null;
        }

        let result = mask({initialValue: initialValue, currentCaretPosition: caretPosition});
        if (result.maskedValue == initialValue) return;

        this.ngModel.control.setValue(result.maskedValue, {
            onlySelf: false,
            emitEvent: true,
            emitModelToViewChange: true
        });

        if (this.isInt(result.newCaretPosition)) this.inputElement.setSelectionRange(result.newCaretPosition, result.newCaretPosition);
    }

    isInt(value) {
        return !isNaN(value) && parseInt(Number(value) as any) == value && !isNaN(parseInt(value, 10));
    }
}