import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Contact, ContactListResponse, ContactPayload, ContactQuery, UploadResponse } from '../../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/contacts`;

  createContact(payload: ContactPayload): Observable<Contact> {
    return this.http.post<Contact>(this.baseUrl, payload);
  }

  getContacts(query: ContactQuery): Observable<ContactListResponse> {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('limit', String(query.limit))
      .set('search', query.search || '')
      .set('filter', query.filter || '')
      .set('sortBy', query.sortBy || 'updatedAt')
      .set('sortOrder', query.sortOrder || 'DESC');

    return this.http.get<ContactListResponse>(this.baseUrl, { params });
  }

  getContact(id: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.baseUrl}/${id}`);
  }

  updateContact(id: number, payload: ContactPayload): Observable<Contact> {
    return this.http.put<Contact>(`${this.baseUrl}/${id}`, payload);
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  batchDelete(ids: number[]): Observable<{ deleted: number }> {
    return this.http.post<{ deleted: number }>(`${this.baseUrl}/batch-delete`, { ids });
  }

  uploadContacts(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(`${this.baseUrl}/upload`, formData);
  }

  exportContacts(ids: number[] = []): Observable<Blob> {
    const params = ids.length ? new HttpParams().set('ids', ids.join(',')) : undefined;
    return this.http.get(`${this.baseUrl}/export`, { params, responseType: 'blob' });
  }

  lockContact(id: number, editorId: string): Observable<Contact> {
    return this.http.post<Contact>(`${this.baseUrl}/${id}/lock`, { editorId });
  }

  unlockContact(id: number, editorId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/unlock`, { editorId });
  }
}
