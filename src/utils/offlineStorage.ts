// Simple offline storage utility using localStorage for now
// In a production app, you'd want to use IndexedDB for better performance

import { Book, User, BorrowRecord, Category } from '../types';

const STORAGE_KEYS = {
  BOOKS: 'library_books_cache',
  USERS: 'library_users_cache',
  BORROWS: 'library_borrows_cache',
  CATEGORIES: 'library_categories_cache',
  LAST_SYNC: 'library_last_sync'
};

// Books cache
export const cacheBooksOffline = (books: Book[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (error) {
    console.error('Error caching books offline:', error);
  }
};

export const getCachedBooks = (): Book[] => {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.BOOKS);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error retrieving cached books:', error);
    return [];
  }
};

// Users cache
export const cacheUsersOffline = (users: User[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Error caching users offline:', error);
  }
};

export const getCachedUsers = (): User[] => {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.USERS);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error retrieving cached users:', error);
    return [];
  }
};

// Borrow records cache
export const cacheBorrowsOffline = (borrows: BorrowRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BORROWS, JSON.stringify(borrows));
  } catch (error) {
    console.error('Error caching borrows offline:', error);
  }
};

export const getCachedBorrows = (): BorrowRecord[] => {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.BORROWS);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error retrieving cached borrows:', error);
    return [];
  }
};

// Categories cache
export const cacheCategoriesOffline = (categories: Category[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Error caching categories offline:', error);
  }
};

export const getCachedCategories = (): Category[] => {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error retrieving cached categories:', error);
    return [];
  }
};

// Utility functions
export const getLastSyncTime = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
};

export const clearOfflineCache = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

export const getOfflineCacheSize = (): string => {
  let totalSize = 0;
  Object.values(STORAGE_KEYS).forEach(key => {
    const item = localStorage.getItem(key);
    if (item) {
      totalSize += item.length;
    }
  });
  return `${(totalSize / 1024).toFixed(2)} KB`;
};

export const isOfflineModeAvailable = (): boolean => {
  const hasBooks = getCachedBooks().length > 0;
  const hasUsers = getCachedUsers().length > 0;
  return hasBooks || hasUsers;
};