import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { BarcodeInput } from '../Barcode/BarcodeInput';
import { BarcodeGenerator } from '../Barcode/BarcodeGenerator';

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

export function ProductForm({ product, onClose }: ProductFormProps) {
  const { addProduct, updateProduct, categories, products, findProductByBarcode } = useApp();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    quantity: product?.quantity || 0,
    minQuantity: product?.minQuantity || 5,
    costPrice: product?.costPrice || 0,
    sellingPrice: product?.sellingPrice || 0,
    supplier: product?.supplier || '',
    barcode: product?.barcode || '',
    description: product?.description || '',
  });

  const [barcodeError, setBarcodeError] = useState<string>('');
  const [showExistingProductDialog, setShowExistingProductDialog] = useState(false);
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);

  // Validate barcode uniqueness
  const validateBarcode = (barcode: string) => {
    if (!barcode.trim()) {
      setBarcodeError('');
      return true;
    }

    const existingProduct = products.find(p => 
      p.barcode === barcode.trim() && p.id !== product?.id
    );

    if (existingProduct) {
      setBarcodeError(`الباركود مستخدم بالفعل في المنتج: ${existingProduct.name}`);
      return false;
    }

    setBarcodeError('');
    return true;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate barcode before submission
    if (!validateBarcode(formData.barcode)) {
      return;
    }
    
    if (isEditing) {
      updateProduct(product.id, formData);
    } else {
      addProduct(formData);
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    // Validate barcode on change
    if (name === 'barcode') {
      validateBarcode(value);
    }
  };

  const handleBarcodeChange = (barcode: string) => {
    setFormData(prev => ({ ...prev, barcode }));
    validateBarcode(barcode);
  };

  const handleBarcodeExists = (existingProd: Product) => {
    if (!isEditing) {
      setExistingProduct(existingProd);
      setShowExistingProductDialog(true);
    }
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
    // Check if product exists first
    const existing = findProductByBarcode(barcode);
    if (existing && !isEditing) {
      handleBarcodeExists(existing);
    } else {
      setFormData(prev => ({ ...prev, barcode }));
      validateBarcode(barcode);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

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
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر التكلفة (دينار) *
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
                سعر البيع (دينار) *
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
                placeholder="اسم المورد"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الباركود
              </label>
              <div className="space-y-4">
                {/* Manual input */}
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => handleBarcodeChange(e.target.value)}
                  placeholder="رقم الباركود"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {/* USB Scanner input */}
                <BarcodeInput
                value={formData.barcode}
                onChange={handleBarcodeChange}
                onScan={handleBarcodeScanned}
                placeholder="رقم الباركود"
                autoFocus={false}
                label="أو استخدم الماسح الضوئي"
              />
              </div>
              {barcodeError && (
                <p className="text-red-600 text-sm mt-1">{barcodeError}</p>
              )}
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
              placeholder="وصف المنتج"
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
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'حفظ التعديلات' : 'إضافة المنتج'}
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