import React, { useState } from 'react';
import { Calendar, DollarSign, Plus, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SaleForm } from './SaleForm';
import { PrintOrder } from './PrintOrder';

export function SalesList() {
  const { sales, products, getLastMonthSales } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState<any>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'date' | 'lastMonth'>('all');

  const filteredSales =
    filterMode === 'lastMonth'
      ? getLastMonthSales()
      : filterMode === 'date' && selectedDate
        ? sales.filter(sale => sale.date.startsWith(selectedDate))
        : sales;

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

  const handlePrintSale = (sale: any) => {
    const product = products.find(p => p.id === sale.productId);
    const orderData = {
      id: sale.id,
      items: [{
        name: sale.productName,
        barcode: product?.barcode,
        quantity: sale.quantity,
        unitPrice: sale.unitPrice,
        totalPrice: sale.totalPrice
      }],
      totalAmount: sale.totalPrice,
      totalItems: sale.quantity,
      date: sale.date,
      type: 'sale' as const
    };
    
    setSelectedSaleForPrint(orderData);
    setShowPrintDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">المبيعات</h2>
        
        <div className="flex gap-2 md:gap-4 flex-wrap items-center">
          <button
            onClick={() => setFilterMode('lastMonth')}
            className={`px-3 py-2 rounded-md border transition-colors ${filterMode === 'lastMonth' ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}
            title="عرض مبيعات الشهر الماضي"
          >
            الشهر الماضي
          </button>
          <button
            onClick={() => { setFilterMode('all'); setSelectedDate(''); }}
            className={`px-3 py-2 rounded-md border transition-colors ${filterMode === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}
            title="عرض كل المبيعات"
          >
            عرض الكل
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setFilterMode('date'); }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            مبيعة جديدة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-gray-900">{totalSales.toLocaleString()} د.ع</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">عدد العمليات</p>
              <p className="text-2xl font-bold text-gray-900">{filteredSales.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي القطع</p>
              <p className="text-2xl font-bold text-gray-900">{totalQuantity}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {filteredSales.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مبيعات</h3>
          <p className="text-gray-600">لم يتم تسجيل أي مبيعات للتاريخ المحدد</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المنتج
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الكمية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    سعر الوحدة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المجموع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...filteredSales].reverse().map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sale.date).toLocaleDateString('ar-IQ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.unitPrice.toLocaleString()} د.ع
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.totalPrice.toLocaleString()} د.ع
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handlePrintSale(sale)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        title="طباعة الفاتورة"
                      >
                        <Printer className="w-4 h-4" />
                        طباعة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <SaleForm onClose={() => setShowForm(false)} />
      )}
      
      {/* Print Dialog */}
      {showPrintDialog && selectedSaleForPrint && (
        <PrintOrder
          orderData={selectedSaleForPrint}
          isOpen={showPrintDialog}
          onClose={() => {
            setShowPrintDialog(false);
            setSelectedSaleForPrint(null);
          }}
        />
      )}
    </div>
  );
}