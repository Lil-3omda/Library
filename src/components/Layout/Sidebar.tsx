import React from 'react';
import { Package, ShoppingCart, BarChart3, Settings, Plus, AlertTriangle, TestTube } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: BarChart3 },
    { id: 'products', label: 'المنتجات', icon: Package },
    { id: 'add-product', label: 'إضافة منتج', icon: Plus },
    { id: 'quick-sale', label: 'نقطة البيع', icon: ShoppingCart },
    { id: 'sales', label: 'المبيعات', icon: ShoppingCart },
    { id: 'low-stock', label: 'نفاد المخزون', icon: AlertTriangle },
    { id: 'barcode-test', label: 'اختبار الباركود', icon: TestTube },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-center">مكتبة العراق</h2>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
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