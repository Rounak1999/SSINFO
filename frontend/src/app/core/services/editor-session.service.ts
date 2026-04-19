import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EditorSessionService {
  private readonly storageKey = 'contact-book-editor-id';

  getEditorId(): string {
    const existing = localStorage.getItem(this.storageKey);
    if (existing) {
      return existing;
    }

    const nextValue = `editor-${crypto.randomUUID()}`;
    localStorage.setItem(this.storageKey, nextValue);
    return nextValue;
  }
}
