import React from 'react';
import { Printer, X } from 'lucide-react';

interface PrintOrderProps {
  orderData: {
    id: string;
    customerName?: string;
    items: Array<{
      name: string;
      barcode?: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    totalAmount: number;
    totalItems: number;
    date: string;
    type: 'sale' | 'order';
  };
  isOpen: boolean;
  onClose: () => void;
}

export function PrintOrder({ orderData, isOpen, onClose }: PrintOrderProps) {
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Print Controls - Hidden in print */}
        <div className="flex items-center justify-between p-4 border-b print:hidden">
          <h2 className="text-xl font-bold text-gray-900">طباعة الطلب</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Printer className="w-4 h-4" />
              طباعة
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-8 print:p-4">
          {/* Header */}
          <div className="text-center mb-8 print:mb-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center print:w-12 print:h-12">
                <span className="text-white font-bold text-xl print:text-lg">مكتبة</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">مكتبة العراق</h1>
                <p className="text-gray-600 print:text-sm">نظام إدارة المكتبة</p>
              </div>
            </div>
            <div className="border-b-2 border-gray-300 pb-4">
              <h2 className="text-xl font-semibold text-gray-800 print:text-lg">
                {orderData.type === 'sale' ? 'فاتورة مبيعة' : 'طلب شراء'}
              </h2>
            </div>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-2 gap-8 mb-8 print:gap-4 print:mb-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">معلومات الطلب</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">رقم الطلب:</span> {orderData.id}</p>
                <p><span className="font-medium">التاريخ:</span> {new Date(orderData.date).toLocaleDateString('ar-IQ')}</p>
                <p><span className="font-medium">الوقت:</span> {new Date(orderData.date).toLocaleTimeString('ar-IQ')}</p>
                {orderData.customerName && (
                  <p><span className="font-medium">اسم العميل:</span> {orderData.customerName}</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">ملخص الطلب</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">عدد الأصناف:</span> {orderData.items.length}</p>
                <p><span className="font-medium">إجمالي القطع:</span> {orderData.totalItems}</p>
                <p><span className="font-medium">المبلغ الإجمالي:</span> {orderData.totalAmount.toLocaleString()} د.ع</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8 print:mb-4">
            <h3 className="font-semibold text-gray-800 mb-4 print:mb-2">تفاصيل الطلب</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">المنتج</th>
                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">الباركود</th>
                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">الكمية</th>
                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">سعر الوحدة</th>
                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <td className="border border-gray-300 px-4 py-2 text-sm">{item.name}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm font-mono">
                        {item.barcode || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{item.unitPrice.toLocaleString()} د.ع</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm font-medium">{item.totalPrice.toLocaleString()} د.ع</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border border-gray-300 px-4 py-2 text-sm" colSpan={2}>المجموع الكلي</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-center">{orderData.totalItems}</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">-</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">{orderData.totalAmount.toLocaleString()} د.ع</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Order QR Code Placeholder */}
          <div className="text-center mb-8 print:mb-4">
            <div className="inline-block border-2 border-dashed border-gray-300 p-4 rounded-lg">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-xs text-gray-500">QR Code</span>
              </div>
              <p className="text-xs text-gray-500">رمز الطلب: {orderData.id}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-300 pt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">شكراً لتعاملكم معنا</p>
            <p className="text-xs text-gray-500">
              تم إنشاء هذه الفاتورة بواسطة نظام إدارة المكتبة - مكتبة العراق
            </p>
            <p className="text-xs text-gray-500 mt-1">
              تاريخ الطباعة: {new Date().toLocaleDateString('ar-IQ')} - {new Date().toLocaleTimeString('ar-IQ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}