/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/30/2017.
 */

import {
    Component,
    ComponentRef,
    Type,
    ViewContainerRef,
    ViewChild,
    ComponentFactoryResolver,
    ComponentFactory,
    HostListener,
} from '@angular/core';
import { IModalState, IModalComponent, IModalOption, IModal } from './modal.interface';
import { Observable, BehaviorSubject, Subject } from 'rxjs/Rx';
import 'reflect-metadata';
import { AnimationEvent } from '@angular/animations';
import { getAnimateTrigger } from '../animations/index';
import { Key } from '../common/utils/key-utils';

const FOCUSABLE_ELEMENTS: string =
    '[autofocus]:not([disabled]),' +
    'a[href],area[href],' +
    'button:not([disabled]),' +
    'keygen:not([disabled]),' + //HTML5
    'input:not([disabled]),' +
    'select:not([disabled]),' +
    'textarea:not([disabled]),' +
    'iframe,object,embed,' +
    '[tabindex~=\'0\']:not([disabled]),' +
    '[contenteditable]:not([disabled])';

@Component({
    selector: 'ui-modal-dialog',
    template: `
    <div tabindex="-1" role="dialog" (click)="onContainerClicked($event)" aria-labelledby="modalDialog" aria-hidden="true" 
            class="modal" [@.disabled]="!option.animation"  [@backdropAnimate]="showBackdrop ? 'fadeIn' : 'fadeOut'"
            [ngClass]="{'modal-rel': option.container !== 'body'}"
            [ngStyle]="{'display': visible ? 'block' : 'none'}">           
      <div class="modal-dialog {{option.modalClass}}" role="document"
            [@.disabled]="!option.animation" [@modalAnimate]="option.animation ? animationName : ''" (@modalAnimate.done)="onAnimationStop($event)" 
            [ngClass]="{'modal-lg': option.size==='lg', 'modal-sm': option.size==='sm'}"
            [ngStyle]="{'width': option.width || '', 'height': option.height || ''}">
        <div class="modal-content">
            <div class="modal-header" [ngClass]="option.headerClass||''">
                <button *ngIf="option.showClose" type="button" class="close"
                        aria-label="Close" (click)="onClose('clickClose')">
                        <span aria-hidden="true">&times;</span>
                </button>
                <h4 *ngIf="option.title || option.headerIcon" class="modal-title">
                    <i *ngIf="option.headerIcon" [ngClass]="option.headerIcon"></i>
                    <span *ngIf="option.title">{{ option.title }}</span>
                </h4>
            </div>
            <ng-template #uiModalBody></ng-template>
        </div>
      </div>  
    </div>
  `,
    styles: [`
    .modal {
        background: rgba(0,0,0,0.6);
    }
    .modal.modal-rel {
        position: absolute !important;
        z-index: 51;
    }
    `],
    animations: [
        getAnimateTrigger('modalAnimate', '0.3s', 0, 'ease-out'),
        getAnimateTrigger('backdropAnimate', '0.3s')
    ]
})
export class UiModalComponent<T extends IModalComponent> implements IModal {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _dialogBodyComponentRef: ComponentRef<T>;
    private _dialogComponentType: Type<T>;

    private _stateChangedSource: BehaviorSubject<IModalState> = new BehaviorSubject<IModalState>(null);
    private _stateChanged: Observable<IModalState> = this._stateChangedSource.asObservable();

    private option: IModalOption;
    public animationName: string;
    public visible: boolean = false;
    public showBackdrop: boolean = false;

    private _reason: string;
    private _data: any;

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @ViewChild('uiModalBody', {read: ViewContainerRef})
    private _modalBodyContainerRef: ViewContainerRef;

    @HostListener('keydown', ['$event'])
    public handleClick(event: KeyboardEvent): void {

        switch (event.keyCode) {
            case Key.Escape: {
                if (this.option.closeOnKeyboard) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.onClose('pressESC');
                }
                break;
            }
            case Key.Tab: {
                let modalBody: HTMLElement = <HTMLElement>this._dialogBodyComponentRef.location.nativeElement;
                if (!modalBody)
                    return;
                let focusableNodes: NodeListOf<Element> = modalBody.querySelectorAll(FOCUSABLE_ELEMENTS);
                if (!focusableNodes || focusableNodes.length===0)
                    return;

                var focusChanged = false;
                // redirect first shift+tab to last input
                if (event.shiftKey) {
                    let firstElement: HTMLElement = <HTMLElement>focusableNodes[0];
                    if (firstElement && firstElement === document.activeElement) {
                        let lastElement: HTMLElement = <HTMLElement>focusableNodes[focusableNodes.length - 1];
                        if (lastElement) {
                            lastElement.focus();
                            focusChanged = true;
                        }
                    }
                } else {
                    let lastElement: HTMLElement = <HTMLElement>focusableNodes[focusableNodes.length - 1];
                    if (lastElement && lastElement === document.activeElement) {
                        let firstElement: HTMLElement = <HTMLElement>focusableNodes[0];
                        if (firstElement) {
                            firstElement.focus();
                            focusChanged = true;
                        }
                    }
                }

                if (focusChanged) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            }
        }
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _resolver: ComponentFactoryResolver) {
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    // implements IModal
    public isOpened(): boolean {
        return this.visible;
    }

    // implements IModal
    public hideModal(reason: string = 'close', data?: any){
        this._closeModal(reason, data);
    }

    // implements IModal
    public showModal(): Observable<IModalState> {
        // notify state change on beforeOpen
        this._notifyStateChange({event: 'beforeOpen', modal: this.instance});

        if (this.instance && this.instance.onBeforeOpen) {
            var result = this.instance.onBeforeOpen();
            if (result instanceof Subject) {
                (<Subject<boolean>>result).subscribe((isOpen) => {
                    if (isOpen)
                        this._openModal();
                });
            }
            else {
                if (result)
                    this._openModal();
            }
        }
        else {
            this._openModal();
        }

        return this.getStateChanged();
    }

    get instance(): T {
        return this._dialogBodyComponentRef.instance;
    }

    // get the state changed observable
    public getStateChanged(): Observable<IModalState> {
        return this._stateChanged;
    }

    public onInitModal(componentType: Type<T>, option?: IModalOption, data?: any) {
        this.option = option;
        this._dialogComponentType = componentType;

        this._initializeModal(this.option);

        const factory: ComponentFactory<T> = this._resolver.resolveComponentFactory(this._dialogComponentType);
        this._dialogBodyComponentRef = this._modalBodyContainerRef.createComponent(factory);

        const instance: T = this._dialogBodyComponentRef.instance;
        instance.onClose = (reason?: string, force?: boolean, data?: any) => {
            this.onClose(reason, force, data);
        };
        // passing options
        if (instance.setOptions) {
            instance.setOptions(this.option);
        }
        // passing data
        if (!!data && instance.setInput) {
            instance.setInput(data);
        }
    }

    public onClose(reason?: string, force?: boolean, data?: any) {
        // notify state change on beforeClose
        this._notifyStateChange({event: 'beforeClose', modal: this.instance});

        if (!force && this.instance && this.instance.onBeforeClose) {
            var result = this.instance.onBeforeClose();
            if (result instanceof Subject) {
                (<Subject<boolean>>result).subscribe((isClose) => {
                    if (isClose)
                        this._closeModal(reason, data);
                });
            }
            else {
                if (result)
                    this._closeModal(reason, data);
            }
        }
        else {
            this._closeModal(reason, data);
        }
    }

    public onContainerClicked(event: MouseEvent): void {
        if (this.option.closeOnBackdrop) {
            if ((<HTMLElement>event.target).classList.contains('modal')) {
                event.preventDefault();
                event.stopPropagation();
                this.onClose('clickOutside');
            }
        }
    }

    public onAnimationStop(event: AnimationEvent) {
        if (!this.option.animation)
            return;

        // entering animation finished
        if (event.toState === this.option.enterAnimation) {

            this._afterModalOpened();
        }
        // exiting animation finished
        else if (event.toState === this.option.exitAnimation) {

            this._afterModalClosed();
        }
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    // notify the the state change
    private _notifyStateChange(state: IModalState): void {
        this._stateChangedSource.next(state);
    }

    private _afterModalOpened() {
        // notify state change after opening
        this._notifyStateChange({event: 'opened', modal: this.instance});

        // if auto focus, then set focus
        if (this.option.autofocus) {
            this._focusDialogContent();
        }
    }

    private _afterModalClosed() {
        // turn off backdrop
        this.visible = false;
        this.showBackdrop = false;

        // destroy modal component
        this._dialogBodyComponentRef.destroy();

        // notify state change after closing
        this._notifyStateChange({event: 'closed', modal: this.instance, data: this._data, reason: this._reason});
    }

    private _openModal() {
        this.visible = true;
        this.showBackdrop = true;
        if (this.option.animation) {
            this.animationName = this.option.enterAnimation;
            // notify state change when opening
            this._notifyStateChange({event: 'opening', modal: this.instance});
        }
        else {
            this._afterModalOpened();
        }
    }

    private _closeModal(reason?: string, data?: any) {
        this._reason = reason;
        this._data = data;

        if (this.option.animation) {
            this.animationName = this.option.exitAnimation;
            // notify state change when closing
            this._notifyStateChange({event: 'closing', modal: this.instance});
        }
        else {
            this._afterModalClosed();
        }
    }

    private _focusDialogContent() {
        if (!this._dialogBodyComponentRef
            || !this._dialogBodyComponentRef.location
            || !this._dialogBodyComponentRef.location.nativeElement)
            return;
        let modalBody: HTMLElement = <HTMLElement>this._dialogBodyComponentRef.location.nativeElement;
        if (!modalBody)
            return;
        setTimeout(() => {
            let focusElement: HTMLElement =
                this.option.focusElement
                    ? <HTMLElement>modalBody.querySelector(this.option.focusElement)
                    : <HTMLElement>modalBody.querySelector(FOCUSABLE_ELEMENTS);
            if (focusElement) {
                focusElement.focus();
            }
        }, 0);
    }

    private _initializeModal(options: IModalOption) {
        // if numeric width is provided, make it as in pixel
        if (options.width && typeof options.width === 'number') {
            options.width = options.width + 'px';
        }
        // if numeric height is provided, make it as in pixel
        if (options.height && typeof options.height === 'number') {
            options.height = options.height + 'px';
        }
        // if either width or height is provided, reset the size
        if (options.width || options.height) {
            options.size = null;
        }
        options.modalClass = options.modalClass || '';
        options.enterAnimation = options.enterAnimation || '';
        options.exitAnimation = options.exitAnimation || '';
    }
}