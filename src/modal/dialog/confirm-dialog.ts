/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/31/2017.
 */

import { Component, ViewEncapsulation } from '@angular/core';
import { IModalComponent, IDialogOption } from '../modal.interface';
import { UiModalOptions } from '../modal.decorator';

export const DEFAULT_CONFIRM_DIALOG_OPTION : IDialogOption = {
    buttons: [
        {
            label: 'Yes',
            value: 'clickYes',
            buttonClass: 'btn btn-default',
            buttonIconName: 'ok',
            buttonIconPos: 'left',
            forceToClose: true
        },
        {
            label: 'No',
            value: 'clickNo',
            buttonClass: 'btn btn-primary',
            buttonIconName: 'remove',
            buttonIconPos: 'left',
            forceToClose: true
        }
    ]
}

@Component({
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="modal-body">
            <div class="row">
                <div class="col-md-1 col-lg-1 ">
                    <span class="dialog-message-icon">
                        <i uiIcon name="question" size="3"></i>
                    </span>
                </div>
                <div class="col-md-10 col-lg-10 text-left">
                    <p class="dialog-message-text" [innerHTML]="option.message"></p>
                </div>
		    </div>
        </div>
        <div class="modal-footer">
            <button type="button" *ngFor="let button of option.buttons" 
                    [ngClass]="button.buttonClass" 
                    (click)="onClose(button.value, button.forceToClose===true)">
                <i *ngIf="button.buttonIconClass && (button.buttonIconPos||'left') ==='left'" [ngClass]="button.buttonIconClass"></i>
                <i *ngIf="button.buttonIconName && (button.buttonIconPos||'left') ==='left'" uiIcon [name]="button.buttonIconName"></i>
                <span *ngIf="button.label" [innerHtml]="button.label"></span>
                <i *ngIf="button.buttonIconClass && button.buttonIconPos==='right'" [ngClass]="button.buttonIconClass"></i>
                <i *ngIf="button.buttonIconName && button.buttonIconPos==='right'" uiIcon [name]="button.buttonIconName"></i>
            </button>
        </div>
    `,
    styles: [`
        .dialog-header-confirm {
            padding: 9px 15px;
            border-bottom: 1px solid #eee;
            background-color: #0480be;
            -webkit-border-top-left-radius: 3px;
            -webkit-border-top-right-radius: 3px;
            -moz-border-radius-topleft: 3px;
            -moz-border-radius-topright: 3px;
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
        }
        
        .dialog-header-confirm span,
        .dialog-header-confirm h4 {
            font-size: 20px;
            font-weight: 600;
            color: #ffffff;
        }
        .dialog-header-confirm button.close span {
            color: #ffffff;
        }
        .dialog-message-icon {
            color: #0480be;
        }
        .dialog-message-text {
            font-size: 24px;
            padding-top: 10px;
            font-weight: 500;
        }
        .modal-footer  i+span {
            padding-right: 5px !important;
        }
        .modal-footer  span+i {
            padding-left: 5px !important;
        }
    `]
})
@UiModalOptions({
    title: 'Confirm',
    headerClass: 'dialog-header-confirm',
    headerIcon: '',
    showClose: false,
    draggable: false,
    closeOnKeyboard: false, // force user to select the answer
    closeOnBackdrop: false, // force user to select the answer
    autofocus: true,        // auto set focus on the first button
    focusElement: '.modal-footer button:last-of-type'
})
export class UiConfirmDialogComponent implements IModalComponent {

    private option: any;

    public setOptions(option: any): void {
        this.option = option;
    }
}