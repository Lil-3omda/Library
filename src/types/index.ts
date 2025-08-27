export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  publicationYear: number;
  totalCopies: number;
  availableCopies: number;
  barcode?: string;
  description?: string;
  location?: string; // shelf/section location
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  membershipType: 'student' | 'teacher' | 'public';
  membershipDate: string;
  status: 'active' | 'suspended' | 'expired';
  maxBooksAllowed: number;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  fineAmount?: number;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

// Legacy Product interface for backward compatibility during migration
export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  barcode?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy Sale interface for backward compatibility
export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
}