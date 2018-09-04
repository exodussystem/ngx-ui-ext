/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/30/2017.
 */

import { Subject } from 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';

export interface IModalOption {
    container?: string;         // where the modal is contained. Default is 'window'.
                                // Value can be '#myDiv', '.myContainer' that works with document.querySelector()
    title?: string;             // modal title
    modalClass?: string;        // additional class added to modal-dialog
    headerClass?: string;       // additional class add to modal header
    headerIcon?: string;        // modal icon class add to modal title
    size?: 'sm'|'lg';           // default bootstrap modal size (lg|sm)
    height?: string | number;   // modal height
    width?: string | number;    // modal weight
    closeOnKeyboard?: boolean;  // close the modal when pressing ESCAPE button
    closeOnBackdrop?: boolean;  // close the modal when click on the backdrop
    animation?: boolean;        // animate when entering and exiting
    enterAnimation?: string;    // animation enter/show name
    exitAnimation?: string;     // animation exit/leave/hide name
    showClose?: boolean;        // show close button on top-right
    draggable?: boolean;        // modal can be draggable
    autofocus?: boolean;        // auto set focus after modal dialog is opened
    focusElement?: string;      // element that has focus if set. Default is the first input element
}

export interface IDialogButton {
    label: string;              // label shown in the dialog
    value: string;              // value to send to dialog when this button is clicked
    buttonClass?: string;       // button class name. ('btn btn-default'/'btn btn-primary'/...)
    buttonIconClass?: string;   // button icon class name. ('glyphicon glyphicon-ok'/'glyphicon glyphicon-remove'/...)
    buttonIconName?: string;    // button icon name. ('ok'/'remove'/...), depends on which icon is currently used
    buttonIconPos?: 'left'|'right';// position of button icon relative to button text/label.
    forceToClose?: boolean;     // whether force to close dialog when this button is clicked
}

export interface IDialogOption extends IModalOption {
    message?: string;
    buttons?: Array<IDialogButton>;
}

export interface IModalState {
    event: 'beforeOpen'|'opening'|'opened'|'beforeClose'|'closing'|'closed';
    modal?: any;
    reason?: string;    // user defined reason, clickClose|clickCancel|clickOK|...
    data?: any;
}

export interface IProgressDialogState {
    progress?: number;
    message?: string;
    event: 'start'|'progress'|'completed';
}

export interface IModalComponent {
    setInput?(data: any): void;                     // used to pass input data to modal after it is created
    setOptions?(options: any): void;                // used to store dialog options (if subclass needs to access)
    onClose?(reason?: string, force?: boolean, data?: any ): void;
    onBeforeOpen?(): boolean | Subject<boolean>;    // perform logic before opening modal (etc check security role)
    onBeforeClose?(): boolean | Subject<boolean>;   // perform logic before closing modal (etc ask for saving change)
}

// public modal API interface
export interface IModal {
    isOpened(): boolean;
    hideModal(reason?: string, data?: any);
    showModal(): Observable<IModalState>;
}

export const DEFAULT_MODAL_OPTION: IModalOption = {
    container: 'body',
    closeOnKeyboard: true,
    closeOnBackdrop: true,
    showClose: true,
    draggable: false,
    animation: true,
    enterAnimation: 'bsModalSlideIn',   //default bootstrap modal animation
    exitAnimation: 'bsModalSlideOut',   //default bootstrap modal animation
    autofocus: false
}