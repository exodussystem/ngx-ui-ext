/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 8/7/2017.
 */

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/do';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

    // Observable sources
    private _requestCountSource: Subject<number> =
        new Subject<number>();

    // Observable streams
    public requestCountChange$: Observable<number> =
        this._requestCountSource.asObservable();

    // notify change - increment (+1/-1)
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // TODO: match URL via REGEX and method type
        this._notifyRequestCountChange(+1);
        return next.handle(req).do((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {

                this._notifyRequestCountChange(-1);
            }
        });
    }

    private _notifyRequestCountChange(increment: number): void {
        this._requestCountSource.next(increment);
    }
}