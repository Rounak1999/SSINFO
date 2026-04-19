import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Contact, InvalidRow } from '../../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ExcelService {
  async parseFile(file: File): Promise<Record<string, string>[]> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
  }

  exportContacts(contacts: Contact[], fields: Array<keyof Contact>, fileName: string): void {
    const rows = contacts.map((contact) => {
      const entry: Record<string, string | number | null | undefined> = {};
      fields.forEach((field) => {
        entry[field] = contact[field] as string | number | null | undefined;
      });
      return entry;
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  downloadErrorReport(rows: InvalidRow[]): void {
    const worksheet = XLSX.utils.json_to_sheet(
      rows.map((row) => ({
        Row: row.rowNumber,
        Name: row.name || '',
        Email: row.email || '',
        Phone: row.phone || '',
        Company: row.company || '',
        Address: row.address || '',
        Notes: row.notes || '',
        Errors: row.errors.join(' | '),
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Errors');
    XLSX.writeFile(workbook, 'contact-upload-errors.xlsx');
  }

  saveBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
