import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Book, User, BorrowRecord, Category } from '../types';

// Books
export const booksCollection = collection(db, 'books');
export const usersCollection = collection(db, 'users');
export const borrowsCollection = collection(db, 'borrows');
export const categoriesCollection = collection(db, 'categories');

// Book operations
export const addBook = async (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
  const timestamp = new Date().toISOString();
  const docRef = await addDoc(booksCollection, {
    ...book,
    createdAt: timestamp,
    updatedAt: timestamp
  });
  return docRef.id;
};

export const updateBook = async (id: string, updates: Partial<Book>) => {
  const bookRef = doc(db, 'books', id);
  await updateDoc(bookRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const deleteBook = async (id: string) => {
  const bookRef = doc(db, 'books', id);
  await deleteDoc(bookRef);
};

export const getBooks = async (): Promise<Book[]> => {
  const snapshot = await getDocs(query(booksCollection, orderBy('title')));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Book));
};

export const getBookByBarcode = async (barcode: string): Promise<Book | null> => {
  const q = query(booksCollection, where('barcode', '==', barcode));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Book;
};

export const getBookByISBN = async (isbn: string): Promise<Book | null> => {
  const q = query(booksCollection, where('isbn', '==', isbn));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Book;
};

// User operations
export const addUser = async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  const timestamp = new Date().toISOString();
  const docRef = await addDoc(usersCollection, {
    ...user,
    createdAt: timestamp,
    updatedAt: timestamp
  });
  return docRef.id;
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  const userRef = doc(db, 'users', id);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const deleteUser = async (id: string) => {
  const userRef = doc(db, 'users', id);
  await deleteDoc(userRef);
};

export const getUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(query(usersCollection, orderBy('name')));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as User));
};

// Borrow Record operations
export const addBorrowRecord = async (borrow: Omit<BorrowRecord, 'id'>) => {
  const docRef = await addDoc(borrowsCollection, borrow);
  return docRef.id;
};

export const updateBorrowRecord = async (id: string, updates: Partial<BorrowRecord>) => {
  const borrowRef = doc(db, 'borrows', id);
  await updateDoc(borrowRef, updates);
};

export const getBorrowRecords = async (): Promise<BorrowRecord[]> => {
  const snapshot = await getDocs(query(borrowsCollection, orderBy('borrowDate', 'desc')));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as BorrowRecord));
};

export const getActiveBorrows = async (): Promise<BorrowRecord[]> => {
  const q = query(borrowsCollection, where('status', '==', 'borrowed'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as BorrowRecord));
};

export const getUserBorrows = async (userId: string): Promise<BorrowRecord[]> => {
  const q = query(borrowsCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as BorrowRecord));
};

// Category operations
export const addCategory = async (category: Omit<Category, 'id'>) => {
  const docRef = await addDoc(categoriesCollection, category);
  return docRef.id;
};

export const updateCategory = async (id: string, updates: Partial<Category>) => {
  const categoryRef = doc(db, 'categories', id);
  await updateDoc(categoryRef, updates);
};

export const deleteCategory = async (id: string) => {
  const categoryRef = doc(db, 'categories', id);
  await deleteDoc(categoryRef);
};

export const getCategories = async (): Promise<Category[]> => {
  const snapshot = await getDocs(query(categoriesCollection, orderBy('name')));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Category));
};

// Real-time listeners
export const subscribeToBooks = (callback: (books: Book[]) => void) => {
  return onSnapshot(query(booksCollection, orderBy('title')), (snapshot) => {
    const books = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Book));
    callback(books);
  });
};

export const subscribeToBorrows = (callback: (borrows: BorrowRecord[]) => void) => {
  return onSnapshot(query(borrowsCollection, orderBy('borrowDate', 'desc')), (snapshot) => {
    const borrows = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as BorrowRecord));
    callback(borrows);
  });
};

// Seed data function
export const createSeedData = async () => {
  try {
    // Check if seed data already exists
    const booksSnapshot = await getDocs(booksCollection);
    if (!booksSnapshot.empty) {
      console.log('Seed data already exists');
      return;
    }

    // Add sample categories
    const categories = [
      { name: 'Fiction', description: 'Fiction books and novels' },
      { name: 'Science', description: 'Science and technology books' },
      { name: 'History', description: 'Historical books and biographies' },
      { name: 'Programming', description: 'Programming and computer science' }
    ];

    for (const category of categories) {
      await addCategory(category);
    }

    // Add sample books with barcodes
    const books = [
      {
        title: 'The Odyssey',
        author: 'Homer',
        isbn: '9780140449136',
        barcode: '9780140449136',
        category: 'Fiction',
        publisher: 'Penguin Classics',
        publicationYear: 1996,
        totalCopies: 5,
        availableCopies: 5,
        description: 'Epic poem of Odysseus journey home',
        location: 'A1-Fiction'
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780061120084',
        barcode: '9780061120084',
        category: 'Fiction',
        publisher: 'Harper Perennial',
        publicationYear: 2006,
        totalCopies: 3,
        availableCopies: 3,
        description: 'Classic American novel',
        location: 'A2-Fiction'
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        barcode: '9780451524935',
        category: 'Fiction',
        publisher: 'Signet Classic',
        publicationYear: 1950,
        totalCopies: 4,
        availableCopies: 4,
        description: 'Dystopian social science fiction novel',
        location: 'A3-Fiction'
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        barcode: '9780743273565',
        category: 'Fiction',
        publisher: 'Scribner',
        publicationYear: 2004,
        totalCopies: 6,
        availableCopies: 6,
        description: 'American classic set in the Jazz Age',
        location: 'A4-Fiction'
      },
      {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        isbn: '9780547928227',
        barcode: '9780547928227',
        category: 'Fiction',
        publisher: 'Mariner Books',
        publicationYear: 2012,
        totalCopies: 7,
        availableCopies: 7,
        description: 'Fantasy adventure novel',
        location: 'A5-Fiction'
      }
    ];

    for (const book of books) {
      await addBook(book);
    }

    // Add sample users
    const users = [
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '123-456-7890',
        membershipType: 'student' as const,
        membershipDate: new Date().toISOString(),
        status: 'active' as const,
        maxBooksAllowed: 5
      },
      {
        name: 'Jane Doe',
        email: 'jane.doe@email.com',
        phone: '098-765-4321',
        membershipType: 'teacher' as const,
        membershipDate: new Date().toISOString(),
        status: 'active' as const,
        maxBooksAllowed: 10
      }
    ];

    for (const user of users) {
      await addUser(user);
    }

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Error creating seed data:', error);
    throw error;
  }
};