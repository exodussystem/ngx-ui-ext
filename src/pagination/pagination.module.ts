import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { UiPaginationConfig } from './pagination.config';
import { UiPagerComponent } from './pager.component';
import { UiPaginationComponent } from './pagination.component';

@NgModule({
    imports: [CommonModule],
    declarations: [UiPagerComponent, UiPaginationComponent],
    exports: [UiPagerComponent, UiPaginationComponent]
})
export class UiPaginationModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: UiPaginationModule,
            providers: [UiPaginationConfig]};
    }
}
