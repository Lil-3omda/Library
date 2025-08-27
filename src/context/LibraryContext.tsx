import React, { createContext, useContext, useEffect, useState } from 'react';
import { Book, User, BorrowRecord, Category } from '../types';
import * as firebaseService from '../services/firebaseService';
import * as offlineStorage from '../utils/offlineStorage';

interface LibraryContextType {
  // Books
  books: Book[];
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  findBookByBarcode: (barcode: string) => Promise<Book | null>;
  findBookByISBN: (isbn: string) => Promise<Book | null>;
  
  // Users
  libraryUsers: User[];
  addLibraryUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateLibraryUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteLibraryUser: (id: string) => Promise<void>;
  
  // Borrow Records
  borrowRecords: BorrowRecord[];
  addBorrowRecord: (borrow: Omit<BorrowRecord, 'id'>) => Promise<string>;
  updateBorrowRecord: (id: string, updates: Partial<BorrowRecord>) => Promise<void>;
  getActiveBorrows: () => Promise<BorrowRecord[]>;
  getUserBorrows: (userId: string) => Promise<BorrowRecord[]>;
  
  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<string>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Utilities
  borrowBook: (bookId: string, userId: string, dueDate: string) => Promise<void>;
  returnBook: (borrowId: string) => Promise<void>;
  createSeedData: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

interface LibraryProviderProps {
  children: React.ReactNode;
}

export const LibraryProvider: React.FC<LibraryProviderProps> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [libraryUsers, setLibraryUsers] = useState<User[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize data and set up real-time listeners
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        try {
          // Try to load data from Firebase
          const [booksData, usersData, borrowsData, categoriesData] = await Promise.all([
            firebaseService.getBooks(),
            firebaseService.getUsers(),
            firebaseService.getBorrowRecords(),
            firebaseService.getCategories()
          ]);
          
          setBooks(booksData);
          setLibraryUsers(usersData);
          setBorrowRecords(borrowsData);
          setCategories(categoriesData);
          
          // Cache data for offline use
          offlineStorage.cacheBooksOffline(booksData);
          offlineStorage.cacheUsersOffline(usersData);
          offlineStorage.cacheBorrowsOffline(borrowsData);
          offlineStorage.cacheCategoriesOffline(categoriesData);
          
          // Set up real-time listeners with offline caching
          const unsubscribeBooks = firebaseService.subscribeToBooks((books) => {
            setBooks(books);
            offlineStorage.cacheBooksOffline(books);
          });
          const unsubscribeBorrows = firebaseService.subscribeToBorrows((borrows) => {
            setBorrowRecords(borrows);
            offlineStorage.cacheBorrowsOffline(borrows);
          });
          
          // Cleanup function
          return () => {
            unsubscribeBooks();
            unsubscribeBorrows();
          };
        } catch (onlineError) {
          // If online loading fails, try to load from cache
          console.warn('Failed to load data online, attempting offline mode:', onlineError);
          
          const cachedBooks = offlineStorage.getCachedBooks();
          const cachedUsers = offlineStorage.getCachedUsers();
          const cachedBorrows = offlineStorage.getCachedBorrows();
          const cachedCategories = offlineStorage.getCachedCategories();
          
          if (cachedBooks.length > 0 || cachedUsers.length > 0) {
            setBooks(cachedBooks);
            setLibraryUsers(cachedUsers);
            setBorrowRecords(cachedBorrows);
            setCategories(cachedCategories);
            setError('Running in offline mode - data may not be current');
          } else {
            throw onlineError;
          }
        }
      } catch (err) {
        console.error('Error initializing library data:', err);
        setError('Failed to load library data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Book operations
  const addBook = async (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      return await firebaseService.addBook(book);
    } catch (err) {
      console.error('Error adding book:', err);
      setError('Failed to add book');
      throw err;
    }
  };

  const updateBook = async (id: string, updates: Partial<Book>) => {
    try {
      await firebaseService.updateBook(id, updates);
    } catch (err) {
      console.error('Error updating book:', err);
      setError('Failed to update book');
      throw err;
    }
  };

  const deleteBook = async (id: string) => {
    try {
      await firebaseService.deleteBook(id);
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Failed to delete book');
      throw err;
    }
  };

  const findBookByBarcode = async (barcode: string) => {
    try {
      return await firebaseService.getBookByBarcode(barcode);
    } catch (err) {
      console.error('Error finding book by barcode:', err);
      return null;
    }
  };

  const findBookByISBN = async (isbn: string) => {
    try {
      return await firebaseService.getBookByISBN(isbn);
    } catch (err) {
      console.error('Error finding book by ISBN:', err);
      return null;
    }
  };

  // User operations
  const addLibraryUser = async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await firebaseService.addUser(user);
      // Refresh users list
      const updatedUsers = await firebaseService.getUsers();
      setLibraryUsers(updatedUsers);
      return id;
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user');
      throw err;
    }
  };

  const updateLibraryUser = async (id: string, updates: Partial<User>) => {
    try {
      await firebaseService.updateUser(id, updates);
      // Refresh users list
      const updatedUsers = await firebaseService.getUsers();
      setLibraryUsers(updatedUsers);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
      throw err;
    }
  };

  const deleteLibraryUser = async (id: string) => {
    try {
      await firebaseService.deleteUser(id);
      // Refresh users list
      const updatedUsers = await firebaseService.getUsers();
      setLibraryUsers(updatedUsers);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
      throw err;
    }
  };

  // Borrow Record operations
  const addBorrowRecord = async (borrow: Omit<BorrowRecord, 'id'>) => {
    try {
      return await firebaseService.addBorrowRecord(borrow);
    } catch (err) {
      console.error('Error adding borrow record:', err);
      setError('Failed to add borrow record');
      throw err;
    }
  };

  const updateBorrowRecord = async (id: string, updates: Partial<BorrowRecord>) => {
    try {
      await firebaseService.updateBorrowRecord(id, updates);
    } catch (err) {
      console.error('Error updating borrow record:', err);
      setError('Failed to update borrow record');
      throw err;
    }
  };

  const getActiveBorrows = async () => {
    try {
      return await firebaseService.getActiveBorrows();
    } catch (err) {
      console.error('Error getting active borrows:', err);
      return [];
    }
  };

  const getUserBorrows = async (userId: string) => {
    try {
      return await firebaseService.getUserBorrows(userId);
    } catch (err) {
      console.error('Error getting user borrows:', err);
      return [];
    }
  };

  // Category operations
  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const id = await firebaseService.addCategory(category);
      // Refresh categories list
      const updatedCategories = await firebaseService.getCategories();
      setCategories(updatedCategories);
      return id;
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category');
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await firebaseService.updateCategory(id, updates);
      // Refresh categories list
      const updatedCategories = await firebaseService.getCategories();
      setCategories(updatedCategories);
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await firebaseService.deleteCategory(id);
      // Refresh categories list
      const updatedCategories = await firebaseService.getCategories();
      setCategories(updatedCategories);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
      throw err;
    }
  };

  // High-level operations
  const borrowBook = async (bookId: string, userId: string, dueDate: string) => {
    try {
      const book = books.find(b => b.id === bookId);
      const user = libraryUsers.find(u => u.id === userId);
      
      if (!book || !user) {
        throw new Error('Book or user not found');
      }
      
      if (book.availableCopies <= 0) {
        throw new Error('No copies available');
      }
      
      // Create borrow record
      const borrowRecord: Omit<BorrowRecord, 'id'> = {
        bookId,
        bookTitle: book.title,
        userId,
        userName: user.name,
        borrowDate: new Date().toISOString(),
        dueDate,
        status: 'borrowed'
      };
      
      await firebaseService.addBorrowRecord(borrowRecord);
      
      // Update book availability
      await firebaseService.updateBook(bookId, {
        availableCopies: book.availableCopies - 1
      });
      
    } catch (err) {
      console.error('Error borrowing book:', err);
      setError('Failed to borrow book');
      throw err;
    }
  };

  const returnBook = async (borrowId: string) => {
    try {
      const borrowRecord = borrowRecords.find(b => b.id === borrowId);
      if (!borrowRecord) {
        throw new Error('Borrow record not found');
      }
      
      const book = books.find(b => b.id === borrowRecord.bookId);
      if (!book) {
        throw new Error('Book not found');
      }
      
      // Update borrow record
      await firebaseService.updateBorrowRecord(borrowId, {
        status: 'returned',
        returnDate: new Date().toISOString()
      });
      
      // Update book availability
      await firebaseService.updateBook(borrowRecord.bookId, {
        availableCopies: book.availableCopies + 1
      });
      
    } catch (err) {
      console.error('Error returning book:', err);
      setError('Failed to return book');
      throw err;
    }
  };

  const createSeedData = async () => {
    try {
      await firebaseService.createSeedData();
      
      // Refresh all data after seeding
      const [booksData, usersData, borrowsData, categoriesData] = await Promise.all([
        firebaseService.getBooks(),
        firebaseService.getUsers(),
        firebaseService.getBorrowRecords(),
        firebaseService.getCategories()
      ]);
      
      setBooks(booksData);
      setLibraryUsers(usersData);
      setBorrowRecords(borrowsData);
      setCategories(categoriesData);
      
    } catch (err) {
      console.error('Error creating seed data:', err);
      setError('Failed to create seed data');
      throw err;
    }
  };

  const value: LibraryContextType = {
    books,
    addBook,
    updateBook,
    deleteBook,
    findBookByBarcode,
    findBookByISBN,
    libraryUsers,
    addLibraryUser,
    updateLibraryUser,
    deleteLibraryUser,
    borrowRecords,
    addBorrowRecord,
    updateBorrowRecord,
    getActiveBorrows,
    getUserBorrows,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    borrowBook,
    returnBook,
    createSeedData,
    loading,
    error
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};