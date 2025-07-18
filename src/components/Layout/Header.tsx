import React from 'react';
import { Bell, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Header() {
  const { getLowStockProducts } = useApp();
  const lowStockCount = getLowStockProducts().length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">نظام إدارة المكتبة</h1>
          <p className="text-sm text-gray-600">إدارة المخزون والمبيعات</p>
        </div>
        
        <div className="flex items-center gap-4">
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
    </header>
  );
}