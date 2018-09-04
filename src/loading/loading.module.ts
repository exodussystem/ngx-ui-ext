/**
 * Created by
 *		Tuyen Tran <tuyen.tran@exodussystem.com>
 *		James Hong <james.hong@exodussystem.com>
 *  on 4/27/2017.
 * IMPORTANT NOTES:
 * HttpInterceptorModule is NOT compatible with IE11. ('Proxy' is undefined')
 * In order to make it work, the project must include proxy-polyfill
 * Install:
 *          npm install proxy-polyfill
 * In polyfilles.browser.ts
 *          import 'proxy-polyfill/proxy'
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { LoadingInterceptor } from './loading-interceptor';
import { UiLoadingBarComponent } from './loading-bar.component';
import { UiLoadingMaskComponent } from './loading-mask.component';
import { LoadingService } from './loading.service';
// import { HttpInterceptorModule } from 'ng-http-interceptor/dist/index';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule
        // HttpInterceptorModule
    ],
    declarations: [
        UiLoadingBarComponent,
        UiLoadingMaskComponent
    ],
    exports: [
        UiLoadingBarComponent,
        UiLoadingMaskComponent
    ],
    providers: [
        LoadingService,
        LoadingInterceptor
    ],
})
export class UiLoadingModule {
}