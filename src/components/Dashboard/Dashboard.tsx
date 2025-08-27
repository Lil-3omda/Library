import React from 'react';
import { BookOpen, Users, RotateCcw, AlertTriangle, Calendar, TrendingUp, Package, ShoppingCart } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useApp } from '../../context/AppContext';

export function Dashboard() {
  const { books, libraryUsers, borrowRecords } = useLibrary();
  const { products, sales, getLowStockProducts } = useApp();
  
  const totalBooks = books.length;
  const totalCopies = books.reduce((sum, book) => sum + book.totalCopies, 0);
  const availableCopies = books.reduce((sum, book) => sum + book.availableCopies, 0);
  const borrowedCopies = totalCopies - availableCopies;
  
  const totalProducts = products.length;
  const totalProductStock = products.reduce((sum, product) => sum + product.quantity, 0);
  const lowStockProducts = getLowStockProducts();
  
  const totalMembers = libraryUsers.length;
  const activeMembers = libraryUsers.filter(user => user.status === 'active').length;
  
  const totalBorrows = borrowRecords.length;
  const activeBorrows = borrowRecords.filter(record => record.status === 'borrowed').length;
  const overdueBorrows = borrowRecords.filter(record => {
    return record.status === 'borrowed' && new Date(record.dueDate) < new Date();
  }).length;
  
  const lowStockBooks = books.filter(book => book.availableCopies < 2);
  
  const totalSales = sales.length;
  const todaySales = sales.filter(sale => 
    new Date(sale.date).toDateString() === new Date().toDateString()
  ).length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  
  const recentBorrows = borrowRecords
    .filter(record => record.status === 'borrowed')
    .slice(-5)
    .reverse();

  const statsCards = [
    {
      title: 'إجمالي الكتب',
      value: totalBooks.toLocaleString(),
      subtitle: `${totalCopies} نسخة إجمالية`,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      title: 'إجمالي المنتجات',
      value: totalProducts.toLocaleString(),
      subtitle: `${totalProductStock} قطعة في المخزن`,
      icon: Package,
      color: 'bg-indigo-500',
    },
    {
      title: 'أعضاء المكتبة',
      value: totalMembers.toLocaleString(),
      subtitle: `${activeMembers} نشط`,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'الكتب المعارة حالياً',
      value: activeBorrows.toLocaleString(),
      subtitle: `${borrowedCopies} كتاب معار`,
      icon: RotateCcw,
      color: 'bg-purple-500',
    },
    {
      title: 'إجمالي المبيعات',
      value: totalSales.toLocaleString(),
      subtitle: `${todaySales} مبيعة اليوم`,
      icon: ShoppingCart,
      color: 'bg-orange-500',
    },
    {
      title: 'التنبيهات',
      value: (lowStockBooks.length + lowStockProducts.length + overdueBorrows).toLocaleString(),
      subtitle: `${lowStockBooks.length + lowStockProducts.length} مخزون منخفض، ${overdueBorrows} متأخر`,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      title: 'الإيرادات',
      value: `${totalRevenue.toLocaleString()} د.ع`,
      subtitle: 'إجمالي المبيعات',
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">لوحة القيادة</h2>
        <p className="text-gray-600">نظرة عامة على أنشطة المكتبة والقرطاسية والإحصائيات</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  {card.subtitle && <p className="text-xs text-gray-500">{card.subtitle}</p>}
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">أحدث أنشطة الإعارة</h3>
          {recentBorrows.length > 0 ? (
            <div className="space-y-3">
              {recentBorrows.map((borrow) => (
                <div key={borrow.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{borrow.bookTitle}</p>
                    <p className="text-sm text-gray-500">
                      أعاره {borrow.userName}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-600">{new Date(borrow.borrowDate).toLocaleDateString('ar-EG')}</p>
                    <p className="text-xs text-gray-500">موعد الإرجاع: {new Date(borrow.dueDate).toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">لا توجد أنشطة إعارة حديثة</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">تنبيهات المخزون والتأخيرات</h3>
          {(lowStockBooks.length > 0 || lowStockProducts.length > 0 || overdueBorrows > 0) ? (
            <div className="space-y-3">
              {lowStockBooks.slice(0, 2).map((book) => (
                <div key={book.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">{book.title}</p>
                    <p className="text-sm text-gray-500">{book.author}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-yellow-600">{book.availableCopies} متوفر</p>
                    <p className="text-sm text-gray-500">مخزون منخفض - كتاب</p>
                  </div>
                </div>
              ))}
              {lowStockProducts.slice(0, 2).map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-orange-600">{product.quantity} متوفر</p>
                    <p className="text-sm text-gray-500">مخزون منخفض - منتج</p>
                  </div>
                </div>
              ))}
              {overdueBorrows > 0 && (
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-red-600">كتب متأخرة</p>
                      <p className="text-sm text-gray-500">كتب تجاوزت موعد الإرجاع</p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-red-600">{overdueBorrows} كتاب</p>
                      <p className="text-sm text-gray-500">يحتاج متابعة</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">لا توجد تنبيهات في الوقت الحالي</p>
          )}
        </div>
      </div>
    </div>
  );
}