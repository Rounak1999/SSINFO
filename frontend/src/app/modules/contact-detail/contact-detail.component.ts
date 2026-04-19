import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContactService } from '../../core/services/contact.service';
import { EditorSessionService } from '../../core/services/editor-session.service';
import { Contact } from '../../models/contact.model';

@Component({
  selector: 'app-contact-detail',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  templateUrl: './contact-detail.component.html',
  styleUrl: './contact-detail.component.scss',
})
export class ContactDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly contactService = inject(ContactService);
  private readonly editorSession = inject(EditorSessionService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly editorId = this.editorSession.getEditorId();
  private readonly routeId = this.route.snapshot.paramMap.get('id');
  private readonly contactId = !this.routeId || this.routeId === 'new' ? null : Number(this.routeId);
  protected readonly isCreateMode = this.contactId === null;

  protected readonly contact = signal<Contact | null>(null);
  protected readonly isLockedByOther = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly headerTitle = computed(() => (this.isCreateMode ? 'Create contact' : this.contact()?.name || 'Contact detail'));

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
    company: [''],
    address: [''],
    notes: [''],
  });

  constructor() {
    if (this.isCreateMode) {
      return;
    }

    this.loadContact();
    this.destroyRef.onDestroy(() => {
      if (this.contactId !== null) {
        this.contactService.unlockContact(this.contactId, this.editorId).subscribe({ error: () => undefined });
      }
    });
  }

  loadContact(): void {
    if (this.contactId === null) {
      return;
    }

    this.contactService.getContact(this.contactId).subscribe({
      next: (contact) => {
        this.contact.set(contact);
        this.form.patchValue(contact);
        this.acquireLock();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to load contact.', 'Close', { duration: 4000 });
        this.router.navigate(['/contacts']);
      },
    });
  }

  acquireLock(): void {
    if (this.contactId === null) {
      return;
    }

    this.contactService
      .lockContact(this.contactId, this.editorId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.isLockedByOther.set(false),
        error: (error) => {
          this.isLockedByOther.set(true);
          this.form.disable();
          this.snackBar.open(error.error?.message || 'Contact is locked by another user.', 'Close', { duration: 4000 });
        },
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const request$ = this.isCreateMode
      ? this.contactService.createContact(this.form.getRawValue())
      : this.contactService.updateContact(this.contactId as number, this.form.getRawValue());

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.snackBar.open(this.isCreateMode ? 'Contact created.' : 'Contact updated.', 'Close', { duration: 3000 });
        this.router.navigate(['/contacts']);
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Save failed.', 'Close', { duration: 4000 });
      },
    });
  }

  delete(): void {
    if (this.contactId === null) {
      return;
    }

    this.contactService.deleteContact(this.contactId).subscribe({
      next: () => {
        this.snackBar.open('Contact deleted.', 'Close', { duration: 3000 });
        this.router.navigate(['/contacts']);
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Delete failed.', 'Close', { duration: 4000 });
      },
    });
  }
}
