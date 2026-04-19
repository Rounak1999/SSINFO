import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  readonly isLoading = signal(false);
  private requests = 0;

  start(): void {
    this.requests += 1;
    this.isLoading.set(true);
  }

  stop(): void {
    this.requests = Math.max(0, this.requests - 1);
    this.isLoading.set(this.requests > 0);
  }
}
