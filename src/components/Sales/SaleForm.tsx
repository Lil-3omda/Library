import React, { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SaleFormProps {
  onClose: () => void;
}

export function SaleForm({ onClose }: SaleFormProps) {
  const { products, addSale } = useApp();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const totalPrice = selectedProduct ? selectedProduct.sellingPrice * quantity : 0;
  const maxQuantity = selectedProduct ? selectedProduct.quantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || quantity <= 0 || quantity > maxQuantity) {
      return;
    }

    addSale({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      unitPrice: selectedProduct.sellingPrice,
      totalPrice,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">تسجيل مبيعة جديدة</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المنتج *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setQuantity(1);
              }}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر المنتج</option>
              {products.filter(p => p.quantity > 0).map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - متوفر: {product.quantity} - {product.sellingPrice.toLocaleString()} د.ع
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الكمية *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  max={maxQuantity}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  الحد الأقصى: {maxQuantity} قطعة
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">سعر الوحدة:</span>
                  <span className="font-medium">{selectedProduct.sellingPrice.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">الكمية:</span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">المجموع:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {totalPrice.toLocaleString()} د.ع
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={!selectedProduct || quantity <= 0 || quantity > maxQuantity}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              تسجيل المبيعة
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}