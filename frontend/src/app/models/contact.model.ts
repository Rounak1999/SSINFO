export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  notes?: string;
  isLocked: boolean;
  lockedBy?: string | null;
  lockExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  notes?: string;
}

export interface ContactQuery {
  page: number;
  limit: number;
  search?: string;
  filter?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ContactListResponse {
  data: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface InvalidRow {
  rowNumber: number;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  errors: string[];
}

export interface UploadResponse {
  validCount: number;
  invalidCount: number;
  validData: ContactPayload[];
  invalidRows: InvalidRow[];
}
