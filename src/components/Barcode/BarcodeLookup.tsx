import React, { useState } from 'react';
import { Search, Package, ShoppingCart, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { BarcodeScanner } from './BarcodeScanner';

interface BarcodeLookupProps {
  onProductFound?: (product: Product) => void;
  onProductNotFound?: (barcode: string) => void;
  autoOpenSale?: boolean;
}

export function BarcodeLookup({ 
  onProductFound, 
  onProductNotFound, 
  autoOpenSale = false 
}: BarcodeLookupProps) {
  const { products } = useApp();
  const [showScanner, setShowScanner] = useState(false);
  const [searchBarcode, setSearchBarcode] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [lastSearchedBarcode, setLastSearchedBarcode] = useState('');
  const [showNotFound, setShowNotFound] = useState(false);

  const searchProductByBarcode = (barcode: string) => {
    if (!barcode.trim()) return;

    // Exact match for barcode
    const product = products.find(p => p.barcode && p.barcode.trim() === barcode.trim());
    setLastSearchedBarcode(barcode);
    
    if (product) {
      setFoundProduct(product);
      setShowNotFound(false);
      if (onProductFound) {
        onProductFound(product);
      }
    } else {
      setFoundProduct(null);
      setShowNotFound(true);
      if (onProductNotFound) {
        onProductNotFound(barcode);
      }
    }
  };

  const handleBarcodeDetected = (barcode: string) => {
    // Clean the barcode and search
    const cleanBarcode = barcode.trim();
    setSearchBarcode(barcode);
    searchProductByBarcode(cleanBarcode);
    setShowScanner(false);
  };

  const handleManualSearch = () => {
    const cleanBarcode = searchBarcode.trim();
    searchProductByBarcode(cleanBarcode);
  };

  const clearSearch = () => {
    setSearchBarcode('');
    setFoundProduct(null);
    setShowNotFound(false);
    setLastSearchedBarcode('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Search className="w-5 h-5" />
          البحث بالباركود
        </h3>
        <button
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Package className="w-4 h-4" />
          مسح الباركود
        </button>
      </div>

      <div className="space-y-4">
        {/* Manual Search Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchBarcode}
            onChange={(e) => setSearchBarcode(e.target.value)}
            placeholder="أدخل رقم الباركود للبحث"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
          />
          <button
            onClick={handleManualSearch}
            disabled={!searchBarcode.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            بحث
          </button>
          {(foundProduct || showNotFound) && (
            <button
              onClick={clearSearch}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              مسح
            </button>
          )}
        </div>

        {/* Search Results */}
        {foundProduct && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-green-900">{foundProduct.name}</h4>
                <div className="mt-2 space-y-1 text-sm text-green-700">
                  <p><span className="font-medium">التصنيف:</span> {foundProduct.category}</p>
                  <p><span className="font-medium">الكمية المتوفرة:</span> {foundProduct.quantity} قطعة</p>
                  <p><span className="font-medium">سعر البيع:</span> {foundProduct.sellingPrice.toLocaleString()} د.ع</p>
                  <p><span className="font-medium">الباركود:</span> {foundProduct.barcode}</p>
                  {foundProduct.supplier && (
                    <p><span className="font-medium">المورد:</span> {foundProduct.supplier}</p>
                  )}
                </div>
              </div>
              
              {autoOpenSale && foundProduct.quantity > 0 && (
                <div className="mr-4">
                  <button
                    onClick={() => onProductFound && onProductFound(foundProduct)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    إضافة للمبيعة
                  </button>
                </div>
              )}
            </div>
            
            {foundProduct.quantity <= 0 && (
              <div className="mt-3 flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">المنتج غير متوفر في المخزون</span>
              </div>
            )}
            
            {foundProduct.quantity <= foundProduct.minQuantity && foundProduct.quantity > 0 && (
              <div className="mt-3 flex items-center gap-2 text-yellow-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">تحذير: المخزون قليل ({foundProduct.quantity} قطع متبقية)</span>
              </div>
            )}
          </div>
        )}

        {showNotFound && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">لم يتم العثور على المنتج</p>
                <p className="text-sm mt-1">
                  الباركود "{lastSearchedBarcode}" غير مسجل في النظام
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <BarcodeScanner
        isOpen={showScanner}
        onBarcodeDetected={handleBarcodeDetected}
        onClose={() => setShowScanner(false)}
        title="البحث عن منتج بالباركود"
      />
    </div>
  );
}