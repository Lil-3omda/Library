import { useState, useEffect } from 'react';
import { ShoppingCart, Printer, Keyboard } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { USBBarcodeInput } from '../Barcode/USBBarcodeInput';
import { PrintOrder } from './PrintOrder';
import { Product } from '../../types';

interface OrderItem {
  productId: string;
  name: string;
  barcode?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  totalItems: number;
  date: string;
  type: 'sale' | 'order';
  customerName?: string;
}

export function QuickSale() {
  const { products, addBulkSales, sales } = useApp();
      const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [priceOverrides, setPriceOverrides] = useState<{ [key: string]: number }>({});
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [saleProcessed, setSaleProcessed] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('inventory_orders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  
  
  // Load saved cart and price overrides from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('quick_sale_cart');
      const savedOverrides = localStorage.getItem('quick_sale_price_overrides');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedOverrides) setPriceOverrides(JSON.parse(savedOverrides));
    } catch (e) {
      console.error('Failed to load saved cart from localStorage', e);
    }
  }, []);

  // Persist cart changes
  useEffect(() => {
    try {
      localStorage.setItem('quick_sale_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Persist price overrides changes
  useEffect(() => {
    try {
      localStorage.setItem('quick_sale_price_overrides', JSON.stringify(priceOverrides));
    } catch {}
  }, [priceOverrides]);

  const addToCart = (productId: string, quantity: number = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentQuantity = cart[productId] || 0;
    const newQuantity = currentQuantity + quantity;

    if (newQuantity <= product.quantity) {
      setCart(prev => ({
        ...prev,
        [productId]: newQuantity
      }));
    }
  };

  const handleProductFound = (product: Product) => {
    // Add product to cart when found via barcode
    addToCart(product.id, 1);
  };

  const handleProductNotFound = (barcode: string) => {
    alert(`لم يتم العثور على منتج بالباركود: ${barcode}`);
  };

  
  const processSale = () => {
    const salesData = Object.entries(cart)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        if (!product) return null;

        const unitPrice = priceOverrides[productId] ?? product.sellingPrice;
        return {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
        };
      })
      .filter(sale => sale !== null) as Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }>;

    if (salesData.length > 0) {
      addBulkSales(salesData);

      // Prepare order data for printing
      const orderData = {
        id: Date.now().toString(),
        items: salesData.map(sale => ({
          name: sale.productName,
          barcode: products.find(p => p.id === sale.productId)?.barcode,
          quantity: sale.quantity,
          unitPrice: sale.unitPrice,
          totalPrice: sale.totalPrice
        })),
        totalAmount: getTotalAmount(),
        totalItems: getTotalItems(),
        date: new Date().toISOString(),
        type: 'sale' as const
      };

      setLastOrder(orderData);
      setShowPrintDialog(true);
      setSaleProcessed(true);

      // Persist order so it can be viewed later
      setOrders(prev => {
        const next = [...prev, orderData];
        try {
          localStorage.setItem('inventory_orders', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  const getTotalAmount = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return total;
      const unitPrice = priceOverrides[productId] ?? product.sellingPrice;
      return total + unitPrice * quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">نقطة البيع السريع</h2>
      </div>

      {/* Barcode Lookup Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            إضافة منتج بالماسح
          </h3>
        </div>

        <USBBarcodeInput
          onBarcodeScanned={(barcode) => {
            const code = barcode.trim();
            const product = products.find(p => p.barcode === code);
            if (product) {
              handleProductFound(product);
            } else {
              handleProductNotFound(code);
            }
          }}
          placeholder="امسح باركود المنتج لإضافته للسلة"
          autoFocus={false}
          label="مسح المنتجات"
        />
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

                    const unitPrice = priceOverrides[productId] ?? product.sellingPrice;

                    return (
                      <div key={productId} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {quantity} ×
                            </span>
                            <input
                              type="number"
                              className="w-24 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={unitPrice}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const num = Number(raw);
                                const value = isNaN(num) ? 0 : Math.max(0, num);
                                setPriceOverrides(prev => ({
                                  ...prev,
                                  [productId]: value
                                }));
                              }}
                              min={0}
                            />
                            <span className="text-xs text-gray-500">د.ع</span>
                          </div>
                        </div>
                        <p className="font-medium text-sm">
                          {(quantity * unitPrice).toLocaleString()} د.ع
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

                {lastOrder && (
                  <button
                    onClick={() => setShowPrintDialog(true)}
                    className="w-full mt-2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    طباعة آخر فاتورة
                  </button>
                )}

                <button
                  onClick={() => {
                    setCart({});
                    setPriceOverrides({});
                    setSaleProcessed(false);
                  }}
                  className="w-full mt-2 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  تفريغ السلة
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">آخر الفواتير</h3>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">لا توجد فواتير بعد</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...orders].slice(-10).reverse().map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">فاتورة #{order.id}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.date).toLocaleString('ar-IQ')} • عدد الأصناف: {order.items.length} • إجمالي القطع: {order.totalItems}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-blue-600">
                      {order.totalAmount.toLocaleString()} د.ع
                    </div>
                    <button
                      onClick={() => { setLastOrder(order); setShowPrintDialog(true); }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      طباعة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Print Dialog */}
        {showPrintDialog && lastOrder && (
          <PrintOrder
            orderData={lastOrder}
            isOpen={showPrintDialog}
            onClose={() => setShowPrintDialog(false)}
          />
        )}
      </div>
  );
}
