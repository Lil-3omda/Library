import React, { useState } from 'react';
import { Minus, Plus, ShoppingCart, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function QuickSale() {
  const { products, updateProduct, addSale } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState<{[key: string]: number}>({});

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.includes(searchTerm);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.quantity > 0;
  });

  const categories = [...new Set(products.map(p => p.category))];

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const currentQuantity = cart[productId] || 0;
    if (currentQuantity < product.quantity) {
      setCart(prev => ({
        ...prev,
        [productId]: currentQuantity + 1
      }));
    }
  };

  const removeFromCart = (productId: string) => {
    const currentQuantity = cart[productId] || 0;
    if (currentQuantity > 0) {
      setCart(prev => ({
        ...prev,
        [productId]: currentQuantity - 1
      }));
    }
  };

  const processSale = () => {
    Object.entries(cart).forEach(([productId, quantity]) => {
      if (quantity > 0) {
        const product = products.find(p => p.id === productId);
        if (product) {
          // Add sale record
          addSale({
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: product.sellingPrice,
            totalPrice: product.sellingPrice * quantity,
          });
          
          // Update product quantity
          updateProduct(productId, {
            quantity: product.quantity - quantity
          });
        }
      }
    });
    
    setCart({});
    alert('تم تسجيل المبيعة بنجاح!');
  };

  const getTotalAmount = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.sellingPrice * quantity : 0);
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">نقطة البيع السريع</h2>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="البحث في المنتجات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع التصنيفات</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const cartQuantity = cart[product.id] || 0;
              const remainingStock = product.quantity - cartQuantity;
              
              return (
                <div key={product.id} className="bg-white rounded-lg shadow-md p-4 border hover:shadow-lg transition-shadow">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      {product.sellingPrice.toLocaleString()} د.ع
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      متوفر: {remainingStock} قطعة
                    </span>
                    {cartQuantity > 0 && (
                      <span className="text-sm font-medium text-green-600">
                        في السلة: {cartQuantity}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(product.id)}
                        disabled={cartQuantity === 0}
                        className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="w-8 text-center font-medium">
                        {cartQuantity}
                      </span>
                      
                      <button
                        onClick={() => addToCart(product.id)}
                        disabled={remainingStock === 0}
                        className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {remainingStock === 0 && (
                      <span className="text-xs text-red-600 font-medium">نفد المخزون</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ملخص المبيعة</h3>
            
            {getTotalItems() === 0 ? (
              <p className="text-gray-500 text-center py-8">لم يتم اختيار أي منتجات</p>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {Object.entries(cart).filter(([_, quantity]) => quantity > 0).map(([productId, quantity]) => {
                    const product = products.find(p => p.id === productId);
                    if (!product) return null;
                    
                    return (
                      <div key={productId} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {quantity} × {product.sellingPrice.toLocaleString()} د.ع
                          </p>
                        </div>
                        <p className="font-medium text-sm">
                          {(quantity * product.sellingPrice).toLocaleString()} د.ع
                        </p>
                      </div>
                    );
                  })}
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">عدد القطع:</span>
                    <span className="font-medium">{getTotalItems()}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>المجموع الكلي:</span>
                    <span className="text-blue-600">{getTotalAmount().toLocaleString()} د.ع</span>
                  </div>
                </div>
                
                <button
                  onClick={processSale}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  إتمام المبيعة
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}