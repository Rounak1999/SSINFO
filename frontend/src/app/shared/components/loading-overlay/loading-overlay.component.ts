import { Component, computed, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  imports: [MatProgressSpinnerModule],
  template: `
    @if (visible()) {
      <div class="overlay">
        <mat-spinner diameter="54"></mat-spinner>
      </div>
    }
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        z-index: 1400;
        display: grid;
        place-items: center;
        background: rgba(240, 244, 255, 0.6);
        backdrop-filter: blur(8px) saturate(1.5);
        -webkit-backdrop-filter: blur(8px) saturate(1.5);
      }
      ::ng-deep .overlay .mat-mdc-progress-spinner circle {
        stroke: url(#futuristic-gradient) !important;
      }
    `,
  ],
})
export class LoadingOverlayComponent {
  private readonly loadingService = inject(LoadingService);
  protected readonly visible = computed(() => this.loadingService.isLoading());
}
