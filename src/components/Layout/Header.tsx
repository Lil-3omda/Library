import React, { useState } from 'react';
import { Bell, User, Scan } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BarcodeScanner } from '../Barcode/BarcodeScanner';
import { BarcodeNotification } from '../Barcode/BarcodeNotification';

export function Header() {
  const { getLowStockProducts, findProductByBarcode } = useApp();
  const [showQuickScan, setShowQuickScan] = useState(false);
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
  const lowStockCount = getLowStockProducts().length;

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({
      type,
      title,
      message,
      isVisible: true
    });
  };

  const handleQuickScan = (barcode: string) => {
    // Clean the barcode before searching
    const cleanBarcode = barcode.trim();
    const product = findProductByBarcode(cleanBarcode);
    
    if (product) {
      showNotification(
        'success',
        'تم العثور على المنتج',
        `${product.name}\nالكمية: ${product.quantity}\nالسعر: ${product.sellingPrice.toLocaleString()} د.ع\nالباركود: ${product.barcode}`
      );
    } else {
      showNotification(
        'error',
        'لم يتم العثور على المنتج',
        `لا يوجد منتج بالباركود: ${cleanBarcode}`
      );
    }
    setShowQuickScan(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">نظام إدارة المكتبة</h1>
          <p className="text-sm text-gray-600">إدارة المخزون والمبيعات</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowQuickScan(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            title="مسح سريع للباركود"
          >
            <Scan className="w-5 h-5" />
            <span className="text-sm font-medium">مسح باركود</span>
          </button>
          
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
            <span className="text-sm font-medium text-gray-700">المدير</span>
          </div>
        </div>
      </div>
      
      <BarcodeScanner
        isOpen={showQuickScan}
        onBarcodeDetected={handleQuickScan}
        onClose={() => setShowQuickScan(false)}
        title="مسح سريع للباركود"
      />
      
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