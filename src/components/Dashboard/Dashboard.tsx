import React from 'react';
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Dashboard() {
  const { products, sales, getLowStockProducts } = useApp();
  
  const totalProducts = products.length;
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const lowStockProducts = getLowStockProducts();
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalCost = sales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.productId);
    return sum + (product ? product.costPrice * sale.quantity : 0);
  }, 0);
  const totalProfit = totalRevenue - totalCost;

  const recentSales = sales.slice(-5).reverse();

  const statsCards = [
    {
      title: 'إجمالي المنتجات',
      value: totalProducts.toLocaleString(),
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'إجمالي المبيعات',
      value: `${totalSales.toLocaleString()} د.ع`,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      title: 'صافي الربح',
      value: `${totalProfit.toLocaleString()} د.ع`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'تنبيهات المخزون',
      value: lowStockProducts.length.toLocaleString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">لوحة التحكم</h2>
        <p className="text-gray-600">نظرة عامة على نشاط المكتبة</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">المبيعات الأخيرة</h3>
          {recentSales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{sale.productName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(sale.date).toLocaleDateString('ar-IQ')}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{sale.totalPrice.toLocaleString()} د.ع</p>
                    <p className="text-sm text-gray-500">{sale.quantity} قطعة</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">لا توجد مبيعات حتى الآن</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">تنبيهات المخزون المنخفض</h3>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-red-600">{product.quantity} قطعة</p>
                    <p className="text-sm text-gray-500">الحد الأدنى: {product.minQuantity}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">جميع المنتجات متوفرة بكميات كافية</p>
          )}
        </div>
      </div>
    </div>
  );
}