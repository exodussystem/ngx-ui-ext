import { NgModule, ModuleWithProviders } from '@angular/core';
import { UiAnchorModule } from './anchor/anchor.module';
import { UiDateTimeSelectModule } from './datetime/datetime-select.module';
import { UiIconModule } from './icon/icon.module';
import { UiInputModule } from './input/input.module';
import { UiLoadingModule } from './loading/loading.module';
import { UiPanelModule } from './panel/panel.module';
import { UiPaginationModule } from './pagination/pagination.module';
import { UiStickyModule } from './sticky/sticky.module';
import { UiTableModule } from './table/table.module';
import { UiTooltipModule } from './tooltip/tooltip.module';
import { UiSelectModule } from './select/select/select.module';
import { UiTypeaheadModule } from './select/typeahead/typeahead.module';

export * from './anchor/index';
export * from './animations/index';
export * from './datetime/index';
export * from './icon/index';
export * from './input/index';
export * from './loading/index';
export * from './modal/index';
export * from './pagination/index';
export * from './panel/index';
export * from './common/index'
export * from './sticky/index';
export * from './table/index';
export * from './tooltip/index';
export * from './select/index';

const NGX_UI_EXT_MODULES_FOR_ROOT = [
    UiAnchorModule,
    UiDateTimeSelectModule,
    UiIconModule.forRoot(),
    UiInputModule,
    UiLoadingModule,
    UiPaginationModule.forRoot(),
    UiPanelModule,
    UiStickyModule,
    UiSelectModule,
    UiTableModule,
    UiTooltipModule,
    UiTypeaheadModule,
];

const NGX_UI_EXT_MODULES = [
    UiAnchorModule,
    UiDateTimeSelectModule,
    UiIconModule,
    UiInputModule,
    UiLoadingModule,
    UiPaginationModule,
    UiPanelModule,
    UiSelectModule,
    UiStickyModule,
    UiTableModule,
    UiTooltipModule,
    UiTypeaheadModule,
];

@NgModule({
    imports: [NGX_UI_EXT_MODULES_FOR_ROOT],
    exports: [NGX_UI_EXT_MODULES]
})
export class NgxUiExtRootModule {
}

@NgModule({exports: [NGX_UI_EXT_MODULES]})
export class NgxUiExtModule {
    public static forRoot(): ModuleWithProviders {
        return {ngModule: NgxUiExtRootModule};
    }
}