/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 1/30/2017.
 */

import { Component, Input, OnDestroy } from "@angular/core";
import { LoadingInterceptor } from './loading-interceptor';
import { Subscription } from 'rxjs/Rx';

// Since Angular 4.3, HttpClient is introduced to replace HttpInterceptorService
// import { HttpInterceptorService } from "ng-http-interceptor/dist/index";

@Component({
    selector: 'ui-loading-bar',
    template: `
<div id="loading-spinner"
    [style.opacity]="visible ? 1 : 0"
    [style.-webkit-transition]="'all ' + animationTime + 'ms linear'"
    [style.-moz-transition]="'all ' + animationTime + 'ms linear'"
    [style.-o-transition]="'all ' + animationTime + 'ms linear'"
    [style.transition]="'all ' + animationTime + 'ms linear'">
    <div class="loading-spinner-icon"
    	[style.width]="(10 + 2 * height) + 'px'"
	    [style.height]="(10 + 2 * height) + 'px'"
        [style.border]="'solid ' + height + 'px transparent'"
        [style.border-top-color]="color" 
        [style.border-left-color]="color"
        [style.-webkit-animation]="'loading-spinner ' + animationTime + 'ms linear infinite'"
        [style.-moz-animation]="'loading-spinner ' + animationTime + 'ms linear infinite'"
        [style.-ms-animation]="'loading-spinner ' + animationTime + 'ms linear infinite'"
        [style.-o-animation]="'loading-spinner ' + animationTime + 'ms linear infinite'"
        [style.animation]="'loading-spinner ' + animationTime + 'ms linear infinite'"></div>
</div>
<div id="loading-bar"
    [style.width]="progress + '%'" 
    [style.backgroundColor]="color" 
    [style.color]="color"
    [style.height]="height + 'px'" 
    [style.opacity]="visible ? 1 : 0"
    [style.-webkit-transition]="'all ' + animationTime + 'ms linear'"
    [style.-moz-transition]="'all ' + animationTime + 'ms linear'"
    [style.-o-transition]="'all ' + animationTime + 'ms linear'"
    [style.transition]="'all ' + animationTime + 'ms linear'">
    <div class="loading-bar-progress"
        [style.height]="height + 'px'" 
        [style.-webkit-transition]="'width ' + animationTime + 's'"
        [style.-moz-transition]="'width ' + animationTime + 's'"
        [style.-o-transition]="'width ' + animationTime + 's'"
        [style.transition]="'width ' + animationTime + 's'">
        <div class="peg"
            [style.height]="height + 'px'" 
            [style.-moz-box-shadow]="color + ' 1px 0 6px 1px'"
            [style.-ms-box-shadow]="color + ' 1px 0 6px 1px'"
            [style.-webkit-box-shadow]="color + ' 1px 0 6px 1px'"
            [style.box-shadow]="color + ' 1px 0 6px 1px'"></div>
    </div>
</div>
      `,
    styles: [`
#loading-bar,
#loading-spinner {
	position: fixed;
	z-index: 10002;
    margin: 0;
    padding: 0;
    top: 0;
    left: 0;
    right: 0;
	width: 100%;
	pointer-events: none;
	-webkit-pointer-events: none;
}

#loading-bar .loading-bar-progress {
	margin: 0;
    padding: 0;
    z-index: 10002;
    box-shadow: 0 0 10px 0;
    opacity: 0;
	border-bottom-right-radius: 1px;
	border-top-right-radius: 1px;
}

/* Fancy blur effect */
#loading-bar .peg {
	position: absolute;
	width: 70px;
	right: 0;
	top: 0;
	opacity: .45;
	-moz-border-radius: 100%;
	-webkit-border-radius: 100%;
	border-radius: 100%;
}

#loading-spinner {
	display: block;
	position: fixed;
	z-index: 10002;
	top: 10px;
	left: 10px;
}

#loading-spinner .loading-spinner-icon {
	width: 14px;
	height: 14px;
	border-radius: 50%;
}

@-webkit-keyframes loading-spinner {
	0%   { -webkit-transform: rotate(0deg);   transform: rotate(0deg); }
	100% { -webkit-transform: rotate(360deg); transform: rotate(360deg); }
}
@-moz-keyframes loading-spinner {
	0%   { -moz-transform: rotate(0deg);   transform: rotate(0deg); }
	100% { -moz-transform: rotate(360deg); transform: rotate(360deg); }
}
@-o-keyframes loading-spinner {
	0%   { -o-transform: rotate(0deg);   transform: rotate(0deg); }
	100% { -o-transform: rotate(360deg); transform: rotate(360deg); }
}
@-ms-keyframes loading-spinner {
	0%   { -ms-transform: rotate(0deg);   transform: rotate(0deg); }
	100% { -ms-transform: rotate(360deg); transform: rotate(360deg); }
}
@keyframes loading-spinner {
	0%   { transform: rotate(0deg);   transform: rotate(0deg); }
	100% { transform: rotate(360deg); transform: rotate(360deg); }
}
`]
})
export class UiLoadingBarComponent implements OnDestroy {

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    /**
     * Color of loading bar and loading spinner
     */
    @Input()
    color: string = "#4092F1";      // 'blue', 'firebrick', ''#29d'

    /**
     * The height (thickness) of loading bar (in pixels)
     */
    @Input()
    height: number = 2;             // default value is 2px

    /**
     * Animation time set in DOM object 's style (in milliseconds)
     */
    @Input()
    animationTime: number = 350;   // default value is 350 ms

    /**
     * The completed percentage showing in loading bar
     */
    @Input()
    progress: number = 0;           // from 0 to 100

    /**
     * The initial percentage when first showing loading bar (decimal value from 0.01 to 0.99)
     */
    @Input()
    startSize: number = 0.02;       // from 0.01 to 1.00 (default value is 0.02 ~ 2%)

    /**
     * The amount of time spent fetching before showing the loading bar (in milliseconds)
     */
    @Input()
    latencyThreshold: number = 100; // default value is 100 ms

    /**
     * Indicator that the loading bar is progressed by itself (when set to true).
     * Otherwise it will be controlled by service which calculating requests and responses
     */
    @Input()
    autoIncrement: boolean = false;

    /**
     * When autoIncrement is set to true, Interval time will be used to update loading bar (in milliseconds)
     */
    @Input()
    runInterval: number = 150;      // default value is 150 ms

    // -------------------------------------------------------------------------
    // Public Properties
    // -------------------------------------------------------------------------

    visible: boolean = false;

    // -------------------------------------------------------------------------
    // Private Properties
    // -------------------------------------------------------------------------

    private _subscription: Subscription;

    private _runningIntervalHandle: any;

    /**
     * timeout handle for latencyThreshold
     */
    private _timeoutHandle: any;

    /**
     * indicator that the loading process is started
     */
    private _started: boolean = false;

    /**
     * The total number of requests made
     */
    private _reqsTotal: number = 0;

    /**
     * The number of requests completed (either successfully or not)
     */
    private _reqsCompleted: number = 0;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

/*
    constructor(private httpInterceptor: HttpInterceptorService) {
        httpInterceptor.request().addInterceptor((data, method) => {
            console.debug(method, data);
            this._incrementRequestCount();
            return data;
        });

        httpInterceptor.response().addInterceptor((res, method) => {
            //res.subscribe(r => console.debug(method, r));
            this._decrementRequestCount();
            return res;
        });
    }
*/
    constructor(loadingInterceptor: LoadingInterceptor) {
        this._subscription =
            loadingInterceptor.requestCountChange$
                .subscribe((increment: number) => {

                    if (increment > 0)
                        this._incrementRequestCount();
                    else
                        this._decrementRequestCount();
                });
    }

    // -------------------------------------------------------------------------
    // Lifecycle listeners
    // -------------------------------------------------------------------------

    // implements OnDestroy
    ngOnDestroy () : void {
        if (this._subscription)
            this._subscription.unsubscribe();
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    /**
     * Inserts the loading bar element into the DOM, and sets it to 2%
     */
    start(): void {

        // do not continually broadcast the started event:
        if (this._started) {
            return;
        }
        this.stop();
        this._started = true;
        this.visible = true;
        // if auto increment, update the process periodically
        if (this.autoIncrement) {
            this._runningIntervalHandle = setInterval(() => {
                this.progress++;
                if (this.progress >= 100)
                    this.complete();
            }, this.runInterval);
        }
        else {
            this.value(this.startSize);
        }
    }

    /**
     * Set the loading bar's width to a certain percent.
     * @param percentage - any value between 0 and 1
     */
    value(percentage: number): void {
        if (!this._started) {
            return;
        }

        this.progress = percentage * 100;


        // increment loadingbar to give the illusion that there is always
        // progress but make sure to cancel the previous timeouts so we don't
        // have multiple incs running at the same time.
        if (this._timeoutHandle)
            clearTimeout(this._timeoutHandle);
        this._timeoutHandle =
            setTimeout( () => {
                this._incrementRandom();
            }, 100);
    }

    stop(): void {
        // increment loadingbar to give the illusion that there is always
        // progress but make sure to cancel the previous timeouts so we don't
        // have multiple incs running at the same time.
        if (this._timeoutHandle) {
            clearTimeout(this._timeoutHandle);
            this._timeoutHandle = null;
        }
        if (this._runningIntervalHandle) {
            clearInterval(this._runningIntervalHandle);
            this._runningIntervalHandle = null;
        }
    }

    reset() {
        this.stop();
        this.progress = 0;
    }

    // ui-component complete
    complete(): void {
        this.stop();
        this.value(1);
        this._started = false;
        setTimeout(() => {
            this.visible = false;
            setTimeout(() => {
                this.progress = 0;
            }, this.animationTime);
        }, this.animationTime);
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private _decrementRequestCount(): void {
        this._reqsCompleted++;

        if (this._reqsCompleted >= this._reqsTotal) {
            // set loading bar as completed
            this.complete();
            // reset counts
            this._reqsCompleted = 0;
            this._reqsTotal = 0;
        }
        else {
            this.value(this._reqsCompleted / this._reqsTotal);
        }
    }

    private _incrementRequestCount(): void {
        if (this._reqsTotal === 0) {
            this._timeoutHandle = setTimeout(() => {

                this.start();
            }, this.latencyThreshold);
        }
        else {
            this._reqsTotal++;

            this.value(this._reqsCompleted / this._reqsTotal);

        }
    }

    /**
     * Increments the loading bar by a random
     * amount but slows down as it progresses
     */
    private _incrementRandom(): void {
        if (this.progress >= 100) {
            return;
        }
        var rnd: number = 0;
        var stat: number = this.progress / 100;
        if (stat >= 0 && stat < 0.25) {
            // Start out between 3 - 6% increments
            rnd = (Math.random() * (5 - 3 + 1) + 3) / 100;
        }
        else if (stat >= 0.25 && stat < 0.65) {
            // increment between 0 - 3%
            rnd = (Math.random() * 3) / 100;
        }
        else if (stat >= 0.65 && stat < 0.9) {
            // increment between 0 - 2%
            rnd = (Math.random() * 2) / 100;
        }
        else if (stat >= 0.9 && stat < 0.99) {
            // finally, increment it .5 %
            rnd = 0.005;
        }
        else {
            // after 99%, don't increment:
            rnd = 0;
        }

        let newPercentage = stat + rnd;
        this.value(newPercentage);
    }
}
