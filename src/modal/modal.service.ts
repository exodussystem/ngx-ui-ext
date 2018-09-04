/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 5/30/2017.
 */

import {
    ApplicationRef,
    ComponentFactoryResolver,
    ComponentRef,
    Injectable,
    Injector,
    Type,
    ViewContainerRef
} from '@angular/core';
import { UiModalComponent } from './modal.component';
import { DEFAULT_MODAL_OPTION, IModal, IModalComponent, IModalOption, IModalState } from './modal.interface';
import { AnchorService } from '../anchor/anchor.service';

interface IModalComponentRef {
    componentRef: ComponentRef<UiModalComponent<any>>;
}

@Injectable()
export class UiModalService {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private _allDialogs: IModalComponentRef[] = [];

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private _resolver: ComponentFactoryResolver,
                private _applicationRef: ApplicationRef,
                private _defaultInjector: Injector) {
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    public createModal<T extends IModalComponent>(modalType: Type<T>,
                                                  option?: IModalOption,
                                                  data?: any): IModal {
        return <IModal>this._createModalComponent(modalType, option, data);
    }

    public closeAllModals(reason?: string, data?: any) {
        this._allDialogs.forEach((dialog) => {
            dialog.componentRef.instance.onClose(reason, true, data);
        });
    }

    private _createModalComponent<T extends IModalComponent>(modalType: Type<T>,
                                                             modalOption?: IModalOption,
                                                             data?: any): UiModalComponent<T> {
        let option = Object.assign({}, DEFAULT_MODAL_OPTION,
            Reflect.getMetadata("uimodaloption", modalType) || {},
            modalOption || {});

        // dynamically create modal dialog component (container only)
        const factory = this._resolver.resolveComponentFactory(UiModalComponent);

        let attachToBody: boolean = ('body' === option.container || undefined === option.container);
        let dialogComponentRef: ComponentRef<UiModalComponent<T>>;

        if (attachToBody) {
            dialogComponentRef = factory.create(this._defaultInjector);
            // attach to application root view
            this._applicationRef.attachView(dialogComponentRef.hostView);
            // attach modal container to body
            document.body.appendChild(dialogComponentRef.location.nativeElement);
        }
        else {
            let viewContainerRef: ViewContainerRef;
            let containerElement: HTMLElement;

            // if element is specified in container,
            if (option.container.startsWith('#') || option.container.startsWith('.')) {

                // first, find element
                containerElement = <HTMLElement>document.querySelector(option.container);
                if (!containerElement)
                    throw new Error('Could not find DOM element with selector [' + option.container + '].');

                // then, find the container view reference from element
                viewContainerRef = AnchorService.getAnchor(containerElement);

                if (!viewContainerRef)
                    throw new Error('Could not find Angular ViewContainer from [' + option.container + '].' +
                        'Please provide correct selector and make sure to add uiAnchor directive to the container.');
            }
            else {

                // if view container id is provide, get the view container reference first
                viewContainerRef = AnchorService.getAnchor(option.container);

                if (!viewContainerRef)
                    throw new Error('Could not find Angular ViewContainer from [' + option.container + '].' +
                        'Please provide correct selector and make sure to add uiAnchor directive to the container.');

                // then get the element
                containerElement = viewContainerRef.element.nativeElement;
            }

            dialogComponentRef = viewContainerRef.createComponent(factory);

            // attach modal to container
            containerElement.appendChild(dialogComponentRef.location.nativeElement);
        }

        // keep track of all modal instances
        var dialogParam = {componentRef: dialogComponentRef};
        this._allDialogs.push(dialogParam);

        const instance: UiModalComponent<T> = dialogComponentRef.instance;
        instance.onInitModal(modalType, option, data);
        instance.getStateChanged()
            .subscribe((state: IModalState) => {
                if (state && state.event === 'closed') {

                    // remove from collection of all modal instances
                    var index = this._allDialogs.indexOf(dialogParam);
                    this._allDialogs.splice(index, 1);

                    // detach from application root view
                    // ANGULAR DOCS: The view will be automatically detached when it is destroyed. So no need to:
                    // if (attachToBody)  {
                    //     this._applicationRef.detachView(dialogComponentRef.hostView);
                    // }

                    // destroy modal container component
                    dialogComponentRef.destroy();
                }
            });
        return instance;
    }
}
