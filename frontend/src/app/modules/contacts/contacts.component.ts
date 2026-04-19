import { CommonModule } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ViewChild, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, startWith } from 'rxjs';
import { ContactService } from '../../core/services/contact.service';
import { ExcelService } from '../../core/services/excel.service';
import { Contact } from '../../models/contact.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-contacts',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly contactService = inject(ContactService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly excelService = inject(ExcelService);

  protected readonly contacts = signal<Contact[]>([]);
  protected readonly total = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly displayedColumns = ['select', 'name', 'email', 'phone', 'company', 'updatedAt', 'actions'];
  protected readonly selection = new SelectionModel<Contact>(true, []);
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly filterControl = new FormControl('', { nonNullable: true });
  protected readonly exportFieldControl = new FormControl<Array<keyof Contact>>(['name', 'email', 'phone', 'company'], { nonNullable: true });
  protected readonly exportableFields: Array<{ key: keyof Contact; label: string }> = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'company', label: 'Company' },
    { key: 'address', label: 'Address' },
    { key: 'notes', label: 'Notes' },
  ];

  ngAfterViewInit(): void {
    this.loadContacts();

    this.searchControl.valueChanges.pipe(startWith(this.searchControl.value), debounceTime(300)).subscribe(() => {
      this.paginator.firstPage();
      this.loadContacts();
    });

    this.filterControl.valueChanges.pipe(startWith(this.filterControl.value)).subscribe(() => {
      this.paginator.firstPage();
      this.loadContacts();
    });
  }

  loadContacts(): void {
    this.contactService
      .getContacts({
        page: (this.paginator?.pageIndex || 0) + 1,
        limit: this.paginator?.pageSize || this.pageSize(),
        search: this.searchControl.value,
        filter: this.filterControl.value,
        sortBy: this.sort?.active || 'updatedAt',
        sortOrder: (this.sort?.direction || 'desc').toUpperCase() as 'ASC' | 'DESC',
      })
      .subscribe({
        next: (response) => {
          this.contacts.set(response.data);
          this.total.set(response.pagination.total);
          this.selection.clear();
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Failed to load contacts.', 'Close', { duration: 4000 });
        },
      });
  }

  handleSortChange(_sort: Sort): void {
    this.loadContacts();
  }

  handlePageChange(_event: PageEvent): void {
    this.loadContacts();
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.contacts());
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.contacts().length && this.contacts().length > 0;
  }

  deleteContact(contact: Contact): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Delete contact',
          message: `Delete ${contact.name}? This action cannot be undone.`,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.contactService.deleteContact(contact.id).subscribe({
          next: () => {
            this.snackBar.open('Contact deleted.', 'Close', { duration: 3000 });
            this.loadContacts();
          },
          error: (error) => {
            this.snackBar.open(error.error?.message || 'Delete failed.', 'Close', { duration: 4000 });
          },
        });
      });
  }

  batchDelete(): void {
    const ids = this.selection.selected.map((item) => item.id);
    if (!ids.length) return;

    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Delete selected contacts',
          message: `Delete ${ids.length} contacts?`,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.contactService.batchDelete(ids).subscribe({
          next: () => {
            this.snackBar.open('Selected contacts deleted.', 'Close', { duration: 3000 });
            this.loadContacts();
          },
          error: (error) => {
            this.snackBar.open(error.error?.message || 'Batch delete failed.', 'Close', { duration: 4000 });
          },
        });
      });
  }

  exportSelected(): void {
    const selected = this.selection.selected;
    if (!selected.length) return;
    this.excelService.exportContacts(selected, this.exportFieldControl.value, 'selected-contacts');
  }

  exportFromBackend(): void {
    const ids = this.selection.selected.map((item) => item.id);
    this.contactService.exportContacts(ids).subscribe({
      next: (blob) => this.excelService.saveBlob(blob, ids.length ? 'selected-contacts.xlsx' : 'contacts.xlsx'),
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Export failed.', 'Close', { duration: 4000 });
      },
    });
  }

  openDetail(contact: Contact): void {
    this.router.navigate(['/contacts', contact.id]);
  }
}
