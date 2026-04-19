import { Routes } from '@angular/router';
import { ContactsComponent } from './modules/contacts/contacts.component';
import { ContactDetailComponent } from './modules/contact-detail/contact-detail.component';
import { UploadComponent } from './modules/upload/upload.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'contacts' },
  { path: 'contacts', component: ContactsComponent },
  { path: 'contacts/new', component: ContactDetailComponent },
  { path: 'contacts/:id', component: ContactDetailComponent },
  { path: 'upload', component: UploadComponent },
  { path: '**', redirectTo: 'contacts' },
];
