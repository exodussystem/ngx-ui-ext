/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/31/2017.
 */

import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { IModalComponent, IProgressDialogState, IDialogOption } from '../modal.interface';
import { UiModalOptions } from '../modal.decorator';
import { Subject } from 'rxjs/Rx';
import { IconFontType } from '../../icon/icon';

export const DEFAULT_PROGRESS_DIALOG_OPTION : IDialogOption = {
    buttons: [
        {
            label: 'OK',
            value: 'clickOK',
            buttonClass: 'btn btn-default',
            buttonIconName: 'ok',
            buttonIconPos: 'left',
            forceToClose: true
        }
    ]
}

@Component({
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="modal-body">
            <p *ngIf="message" class="dialog-message-text">{{message}}</p>
            <div class="progress progress-striped active">
                <div class="progress-bar progress-bar-info" [style.width]="progress + '%'" ></div>
                <span class="sr-only">% Complete</span>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" *ngFor="let button of option.buttons" 
                    [ngClass]="button.buttonClass" 
                    (click)="onClose(button.value, button.forceToClose===true)">
                <i *ngIf="button.buttonIconClass && (button.buttonIconPos || button.buttonIconPos==='left')" [ngClass]="button.buttonIconClass"></i>
                <i *ngIf="button.buttonIconName && (!button.buttonIconPos || button.buttonIconPos==='left')" uiIcon [name]="button.buttonIconName"></i>
                <span *ngIf="button.label" [innerHtml]="button.label"></span>
                <i *ngIf="button.buttonIconClass && button.buttonIconPos==='right'" [ngClass]="button.buttonIconClass"></i>
                <i *ngIf="button.buttonIconName && button.buttonIconPos==='right'" uiIcon [name]="button.buttonIconName"></i>
            </button>
        </div>
    `
})
@UiModalOptions({
    title: 'In Progress...',
    headerClass: 'modal-header-primary',
    showClose: false,       // force user to select the answer
    closeOnKeyboard: false, // force user to select the answer
    closeOnBackdrop: false, // force user to select the answer
    autofocus: true,        // auto set focus on the first button
    focusElement: '.modal-footer button:last-of-type'
})
export class UiProgressDialogComponent implements IModalComponent {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    public onClose: (reason?: string, force?: boolean, data?: any )=> void;
    public message: string;
    public progress: number = 0;

    private option: any;
    private fontType: IconFontType = 'fa';

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(@Inject("FONT_TYPE")fontType: IconFontType = 'fa') {
        this.fontType = fontType;
    }

    public setOptions(option: any): void {
        this.option = option;
        if (!this.option['headerIcon']) {
            const prefix: string = this.fontType;
            // headerIcon: 'fa fa-hourglass fa-spin fa-fw',
            // headerIcon: 'glyphicon glyphicon-hourglass glyphicon-spin glyphicon-fw',
            this.option['headerIcon'] = '${prefix} ${prefix}-hourglass ${prefix}-spin ${prefix}-fw';
        }
    }

    public setInput(input: any): void {
        if (input
            && input.progressSubject
            && input.progressSubject instanceof Subject)  {
            (<Subject<IProgressDialogState>>input.progressSubject)
                .asObservable()
                .subscribe((state: IProgressDialogState) => {
                    if (state) {
                        if (state.event !== 'completed') {
                            this.message = state.message;
                            this.progress = state.progress;
                        }
                        else if (this.onClose) {// state.event === 'completed'
                            this.onClose(state.event, true);
                        }
                    }
                });
        }
    }
}