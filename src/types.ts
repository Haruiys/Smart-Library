export interface Book {
  id: string; // QR code UUID
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  status: 'available' | 'borrowed';
  isbn?: string;
  year?: string;
  description?: string;
}

export interface Loan {
  id: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  studentClass: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  selfieProof: string; // Base64 selfie image
  leaseDate: string; // ISO string or simple YYYY-MM-DD
  returnDeadline: string; // leaseDate + 7 days
  returnedAt: string | null;
  status: 'active' | 'returned';
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  class: string;
  avatar: string;
}

export type ActivePage = 'hero' | 'dashboard' | 'scan' | 'confirm' | 'return-view' | 'success' | 'qr-catalog';
