import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiIconModule } from '../icon';
import {
    UiHourSelectorComponent,
    UiMinuteSelectorComponent,
    UiTimeScrollerComponent,
    UiTimestampSelectorComponent,
    UiDaySelectorComponent,
    UiDecadeSelectorComponent,
    UiMonthSelectorComponent,
    UIPeriodSwitchComponent,
    UiYearSelectorComponent
} from './selectors/index';

import {
    UiDateSelectorComponent,
    UiDateTimeSelectComponent,
    UiDateTimeSelectDirective,
    UiTimeSelectorComponent
} from './index';
import { UiDateTimeState } from './selectors/common/datetime.state';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        UiIconModule,
    ],
    declarations: [
        UIPeriodSwitchComponent,
        UiDaySelectorComponent,
        UiMonthSelectorComponent,
        UiDecadeSelectorComponent,
        UiYearSelectorComponent,
        UiHourSelectorComponent,
        UiMinuteSelectorComponent,
        UiTimeScrollerComponent,
        UiTimestampSelectorComponent,
        UiDateSelectorComponent,
        UiTimeSelectorComponent,
        UiDateTimeSelectComponent,
        UiDateTimeSelectDirective,
    ],
    exports: [
        UiDateTimeSelectDirective,
        UiDateTimeSelectComponent
    ],
    entryComponents: [
        UiDateTimeSelectComponent
    ],
    providers: [
        UiDateTimeState
    ]
})
export class UiDateTimeSelectModule {
}
