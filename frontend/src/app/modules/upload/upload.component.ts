import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { ContactService } from '../../core/services/contact.service';
import { ExcelService } from '../../core/services/excel.service';
import { InvalidRow, UploadResponse } from '../../models/contact.model';

@Component({
  selector: 'app-upload',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule, MatTableModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent {
  private readonly contactService = inject(ContactService);
  private readonly excelService = inject(ExcelService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly previewErrors = signal<InvalidRow[]>([]);
  protected readonly uploadResult = signal<UploadResponse | null>(null);
  protected readonly validating = signal(false);
  protected readonly uploading = signal(false);
  protected readonly columns = ['rowNumber', 'name', 'email', 'phone', 'errors'];

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.uploadResult.set(null);
    this.previewErrors.set([]);
    this.selectedFile.set(null);

    if (!file) return;
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      this.snackBar.open('Only .xlsx and .xls files are allowed.', 'Close', { duration: 3000 });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      this.snackBar.open('File size must be below 50MB.', 'Close', { duration: 3000 });
      return;
    }

    this.validating.set(true);
    try {
      const rows = await this.excelService.parseFile(file);
      const errors = rows.flatMap((row, index) => {
        const normalized = {
          name: String(row['Name'] || row['name'] || '').trim(),
          email: String(row['Email'] || row['email'] || '').trim(),
          phone: String(row['Phone'] || row['phone'] || '').trim(),
          company: String(row['Company'] || row['company'] || '').trim(),
          address: String(row['Address'] || row['address'] || '').trim(),
          notes: String(row['Notes'] || row['notes'] || '').trim(),
        };
        const rowErrors: string[] = [];
        if (!normalized.name) rowErrors.push('Name is required.');
        if (!normalized.email) rowErrors.push('Email is required.');
        if (!normalized.phone) rowErrors.push('Phone is required.');
        if (normalized.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) rowErrors.push('Invalid email format.');
        if (normalized.phone && !/^\+?[0-9]{7,15}$/.test(normalized.phone)) rowErrors.push('Invalid phone format.');
        return rowErrors.length
          ? [{ rowNumber: index + 2, ...normalized, errors: rowErrors }]
          : [];
      });
      this.previewErrors.set(errors);
      this.selectedFile.set(file);
    } finally {
      this.validating.set(false);
    }
  }

  uploadFile(): void {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    this.uploading.set(true);
    this.contactService
      .uploadContacts(file)
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: (response) => {
          this.uploadResult.set(response);
          this.previewErrors.set(response.invalidRows);
          this.snackBar.open(`Imported ${response.validCount} contacts.`, 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Upload failed.', 'Close', { duration: 4000 });
        },
      });
  }

  downloadErrors(): void {
    this.excelService.downloadErrorReport(this.previewErrors());
  }
}
