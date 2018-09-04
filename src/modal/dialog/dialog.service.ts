/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/31/2017.
 */

import { Injectable } from '@angular/core';
import { UiModalService } from '../modal.service';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { IDialogOption, IModal, IModalState, IProgressDialogState } from '../modal.interface';
import { DEFAULT_CONFIRM_DIALOG_OPTION, UiConfirmDialogComponent } from './confirm-dialog';
import { DEFAULT_PROGRESS_DIALOG_OPTION, UiProgressDialogComponent } from './progress-dialog';

@Injectable()
export class UiDialogService {

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private modalService: UiModalService) {}

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    public createConfirmDialog(dialogOptions?: IDialogOption): IModal {
        let modalOptions: IDialogOption =
            Object.assign({}, DEFAULT_CONFIRM_DIALOG_OPTION, dialogOptions);

        return this.modalService.createModal(UiConfirmDialogComponent, modalOptions);
    };

    public showConfirmDialog(dialogOptions?: IDialogOption): Observable<IModalState> {
        let confirmDialog:IModal = this.createConfirmDialog(dialogOptions)
        return confirmDialog.showModal();
    }

    public createProgressDialog(dialogOptions?: IDialogOption,
                              progressSubject?: BehaviorSubject<IProgressDialogState>):IModal {
        let modalOptions: IDialogOption =
            Object.assign({}, DEFAULT_PROGRESS_DIALOG_OPTION, dialogOptions);

        return this.modalService.createModal(UiProgressDialogComponent, modalOptions,
                {progressSubject: progressSubject});
    }

    public showProgressDialog(dialogOptions?: IDialogOption,
                              progressSubject?: BehaviorSubject<IProgressDialogState>): Observable<IModalState> {

        let progressDialog:IModal = this.createProgressDialog(dialogOptions, progressSubject);
        return progressDialog.showModal();
    }
}