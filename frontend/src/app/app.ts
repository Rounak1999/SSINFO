import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LoadingOverlayComponent } from './shared/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, LoadingOverlayComponent],
  template: `
    <app-loading-overlay />
    <mat-toolbar class="shell-toolbar">
      <div class="brand">
        <span class="brand-mark">CB</span>
        <div>
          <strong>Advanced Contact Book</strong>
          <p>Angular + Express + MySQL</p>
        </div>
      </div>

      <nav>
        <a mat-button routerLink="/contacts" routerLinkActive="active-link">Contacts</a>
        <a mat-button routerLink="/upload" routerLinkActive="active-link">Upload</a>
      </nav>
    </mat-toolbar>

    <main class="shell-main">
      <router-outlet />
    </main>
  `,
  styleUrl: './app.scss'
})
export class App {}
