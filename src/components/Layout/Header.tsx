import React, { useState } from 'react';
import { Bell, User, Keyboard, LogOut, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { useApp } from '../../context/AppContext';
import { USBBarcodeInput } from '../Barcode/USBBarcodeInput';
import { BarcodeNotification } from '../Barcode/BarcodeNotification';

export function Header() {
  const { currentUser, logout } = useAuth();
  const { books, findBookByBarcode } = useLibrary();
  const { products, findProductByBarcode, getLowStockProducts } = useApp();
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
  
  // Calculate low stock books (less than 2 available copies) and low stock products
  const lowStockBooks = books.filter(book => book.availableCopies < 2).length;
  const lowStockProducts = getLowStockProducts().length;
  const totalLowStock = lowStockBooks + lowStockProducts;

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
    
    // First try to find a book
    const book = await findBookByBarcode(cleanBarcode);
    if (book) {
      showNotification(
        'success',
        'تم العثور على الكتاب',
        `${book.title} بواسطة ${book.author}\nمتوفر: ${book.availableCopies}/${book.totalCopies}\nردمك: ${book.isbn}\nالموقع: ${book.location || 'غير محدد'}`
      );
      return;
    }
    
    // Then try to find a product
    const product = findProductByBarcode(cleanBarcode);
    if (product) {
      showNotification(
        'success',
        'تم العثور على المنتج',
        `${product.name}\nالفئة: ${product.category}\nالكمية: ${product.quantity}\nالسعر: ${product.sellingPrice} دينار`
      );
      return;
    }
    
    // Nothing found
    showNotification(
      'error',
      'لم يتم العثور على النتيجة',
      `لا يوجد كتاب أو منتج بالباركود: ${cleanBarcode}`
    );
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
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">نظام إدارة القرطاسية</h1>
            <p className="text-sm text-gray-600">إدارة الكتب والمنتجات والمبيعات</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Quick USB Scanner */}
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border">
            <Keyboard className="w-5 h-5 text-blue-600" />
            <div className="w-48">
              <USBBarcodeInput
                onBarcodeScanned={handleQuickScan}
                placeholder="مسح سريع..."
                autoFocus={false}
                showIcon={false}
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
            {totalLowStock > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalLowStock}
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
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">تسجيل الخروج</span>
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