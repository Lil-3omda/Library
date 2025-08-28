import React, { useState } from 'react';
import { Save, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { BarcodeInput } from '../Barcode/BarcodeInput';
import { BarcodeGenerator } from '../Barcode/BarcodeGenerator';

export function AddProductPage() {
  const { addProduct, categories, products, findProductByBarcode } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    minQuantity: 5,
    costPrice: 0,
    sellingPrice: 0,
    supplier: '',
    barcode: '',
    description: '',
  });

  const [barcodeError, setBarcodeError] = useState<string>('');
  const [showExistingProductDialog, setShowExistingProductDialog] = useState(false);
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Validate barcode uniqueness
  const validateBarcode = (barcode: string) => {
    if (!barcode.trim()) {
      setBarcodeError('');
      return true;
    }

    const existingProduct = products.find(p => p.barcode === barcode.trim());

    if (existingProduct) {
      setBarcodeError(`الباركود مستخدم بالفعل في المنتج: ${existingProduct.name}`);
      return false;
    }

    setBarcodeError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBarcode(formData.barcode)) {
      return;
    }

    try {
      await addProduct(formData);
      setIsSubmitted(true);
      // Reset form
      setFormData({
        name: '',
        category: '',
        quantity: 0,
        minQuantity: 5,
        costPrice: 0,
        sellingPrice: 0,
        supplier: '',
        barcode: '',
        description: '',
      });
      setBarcodeError('');
      
      // Hide success message after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'minQuantity' || name === 'costPrice' || name === 'sellingPrice' 
        ? Number(value) || 0 
        : value
    }));

    if (name === 'barcode') {
      validateBarcode(value);
    }
  };

  const handleBarcodeChange = (barcode: string) => {
    setFormData(prev => ({ ...prev, barcode }));
    validateBarcode(barcode);
  };

  const handleBarcodeExists = (existingProd: Product) => {
    setExistingProduct(existingProd);
    setShowExistingProductDialog(true);
  };

  const loadExistingProduct = () => {
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        category: existingProduct.category,
        quantity: existingProduct.quantity,
        minQuantity: existingProduct.minQuantity,
        costPrice: existingProduct.costPrice,
        sellingPrice: existingProduct.sellingPrice,
        supplier: existingProduct.supplier,
        barcode: existingProduct.barcode || '',
        description: existingProduct.description || '',
      });
      setBarcodeError('');
      setShowExistingProductDialog(false);
      setExistingProduct(null);
    }
  };

  const continueWithNewProduct = () => {
    setShowExistingProductDialog(false);
    setExistingProduct(null);
  };

  const handleBarcodeScanned = (barcode: string) => {
    const existing = findProductByBarcode(barcode);
    if (existing) {
      handleBarcodeExists(existing);
    } else {
      setFormData(prev => ({ ...prev, barcode }));
      validateBarcode(barcode);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إضافة منتج جديد - مكتبة المربد</h1>
          <p className="text-gray-600">أضف منتجاً جديداً تحت أي فئة من الفئات المتاحة في مكتبة المربد</p>
        </div>
      </div>

      {isSubmitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="mr-3 text-sm text-green-700">تم إضافة المنتج بنجاح!</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المنتج *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل اسم المنتج"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التصنيف *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر التصنيف</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الكمية الحالية *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحد الأدنى للكمية *
              </label>
              <input
                type="number"
                name="minQuantity"
                value={formData.minQuantity}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر التكلفة (دينار عراقي) *
              </label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر البيع (دينار عراقي) *
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المورد
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل اسم المورد"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الباركود
              </label>
              <div className="space-y-4">
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={(e) => handleBarcodeChange(e.target.value)}
                  placeholder="أدخل الباركود يدوياً"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <BarcodeInput
                  value={formData.barcode}
                  onChange={handleBarcodeChange}
                  onScan={handleBarcodeScanned}
                  placeholder="أو امسح الباركود"
                  className="w-full"
                />
                
                {barcodeError && (
                  <p className="text-red-600 text-sm mt-1">{barcodeError}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل وصف المنتج (اختياري)"
            />
          </div>

          {/* Barcode Generator */}
          {formData.barcode && (
            <div>
              <BarcodeGenerator
                value={formData.barcode}
                onGenerate={(barcode) => setFormData(prev => ({ ...prev, barcode }))}
              />
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              <Save className="w-5 h-5" />
              إضافة المنتج
            </button>
          </div>
        </form>
      </div>

      {/* Existing Product Dialog */}
      {showExistingProductDialog && existingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">منتج موجود بالفعل</h3>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">تم العثور على منتج بهذا الباركود:</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{existingProduct.name}</p>
                <p className="text-sm text-gray-600">التصنيف: {existingProduct.category}</p>
                <p className="text-sm text-gray-600">الكمية: {existingProduct.quantity}</p>
                <p className="text-sm text-gray-600">الباركود: {existingProduct.barcode}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadExistingProduct}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                تحميل بيانات المنتج
              </button>
              <button
                onClick={continueWithNewProduct}
                className="flex-1 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50"
              >
                إنشاء منتج جديد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}