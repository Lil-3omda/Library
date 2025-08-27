import React, { useState } from 'react';
import { Bell, User, Keyboard, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { USBBarcodeInput } from '../Barcode/USBBarcodeInput';
import { BarcodeNotification } from '../Barcode/BarcodeNotification';

export function Header() {
  const { currentUser, logout } = useAuth();
  const { books, findBookByBarcode } = useLibrary();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    title: '',
    message: '',
    isVisible: false
  });
  
  // Calculate low stock books (less than 2 available copies)
  const lowStockCount = books.filter(book => book.availableCopies < 2).length;

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({
      type,
      title,
      message,
      isVisible: true
    });
  };

  const handleQuickScan = async (barcode: string) => {
    // Clean the barcode before searching
    const cleanBarcode = barcode.trim();
    const book = await findBookByBarcode(cleanBarcode);
    
    if (book) {
      showNotification(
        'success',
        'Book Found',
        `${book.title} by ${book.author}\nAvailable: ${book.availableCopies}/${book.totalCopies}\nISBN: ${book.isbn}\nLocation: ${book.location || 'Not specified'}`
      );
    } else {
      showNotification(
        'error',
        'Book Not Found',
        `No book found with barcode: ${cleanBarcode}`
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Library Management System</h1>
            <p className="text-sm text-gray-600">Book Inventory & Borrowing Management</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Quick USB Scanner */}
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border">
            <Keyboard className="w-5 h-5 text-blue-600" />
            <div className="w-48">
              <USBBarcodeInput
                onBarcodeScanned={handleQuickScan}
                placeholder="Quick scan..."
                autoFocus={false}
                showIcon={false}
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
            {lowStockCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {lowStockCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {currentUser?.email || 'Admin'}
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
      
      <BarcodeNotification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </header>
  );
}