import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function LowStockAlert() {
  const { getLowStockProducts } = useApp();
  const lowStockProducts = getLowStockProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">تنبيهات المخزون المنخفض</h2>
          <p className="text-gray-600">المنتجات التي تحتاج إلى إعادة تموين</p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="font-medium text-red-800">
            {lowStockProducts.length} منتج يحتاج إلى إعادة تموين
          </span>
        </div>
        <p className="text-red-700 text-sm">
          يرجى مراجعة المنتجات أدناه وإعادة تموين المخزون قبل نفادها تماماً
        </p>
      </div>

      {lowStockProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">جميع المنتجات متوفرة</h3>
          <p className="text-gray-600">لا توجد منتجات تحتاج إلى إعادة تموين حالياً</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المنتج
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التصنيف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الكمية الحالية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحد الأدنى
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المورد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockProducts.map((product) => {
                  const isOutOfStock = product.quantity === 0;
                  
                  return (
                    <tr key={product.id} className={`hover:bg-gray-50 ${isOutOfStock ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.barcode && (
                            <div className="text-sm text-gray-500">باركود: {product.barcode}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-yellow-600'}`}>
                          {product.quantity} قطعة
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.minQuantity} قطعة
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.supplier || 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isOutOfStock 
                            ? 'text-red-600 bg-red-100' 
                            : 'text-yellow-600 bg-yellow-100'
                        }`}>
                          {isOutOfStock ? 'نفد المخزون' : 'مخزون منخفض'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}