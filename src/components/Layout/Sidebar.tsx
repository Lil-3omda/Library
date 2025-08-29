import React from 'react';
import { BookOpen, Users, RotateCcw, BarChart3, Settings, AlertTriangle, TestTube, Package, ShoppingCart } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة القيادة', icon: BarChart3 },
    { id: 'books', label: 'إضافة منتج', icon: BookOpen },
    { id: 'products', label: 'إدارة المنتجات', icon: Package },
    { id: 'sales', label: 'إدارة المبيعات', icon: ShoppingCart },
    { id: 'users', label: 'إدارة الأعضاء', icon: Users },
    { id: 'borrows', label: 'إدارة الإعارة', icon: RotateCcw },
    { id: 'low-stock', label: 'تنبيه المخزون', icon: AlertTriangle },
    { id: 'barcode-test', label: 'اختبار الباركود', icon: TestTube },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8 text-center">
        <Package className="w-8 h-8 mx-auto mb-2 text-blue-400" />
        <h2 className="text-xl font-bold">مكتبة المربد الجديد</h2>
        <p className="text-xs text-gray-400">نظام إدارة المكتبة والقرطاسية</p>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}