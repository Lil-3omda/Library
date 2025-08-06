import React, { useState } from 'react';
import { Scan, Package, ShoppingCart, Printer, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BarcodeInput } from '../Barcode/BarcodeInput';
import { BarcodeScanner } from '../Barcode/BarcodeScanner';
import { PrintOrder } from '../Sales/PrintOrder';

export function BarcodeTestPage() {
  const { products, findProductByBarcode } = useApp();
  const [testBarcode, setTestBarcode] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showPrintTest, setShowPrintTest] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    barcode: string;
    found: boolean;
    product?: any;
    timestamp: string;
  }>>([]);

  // Create sample test order for printing
  const sampleOrder = {
    id: 'TEST-' + Date.now(),
    customerName: 'عميل تجريبي',
    items: [
      {
        name: 'كتاب الرياضيات',
        barcode: '1234567890123',
        quantity: 2,
        unitPrice: 15000,
        totalPrice: 30000
      },
      {
        name: 'قلم أزرق',
        barcode: '9876543210987',
        quantity: 5,
        unitPrice: 1000,
        totalPrice: 5000
      },
      {
        name: 'دفتر 100 ورقة',
        barcode: '5555666677778',
        quantity: 3,
        unitPrice: 3000,
        totalPrice: 9000
      }
    ],
    totalAmount: 44000,
    totalItems: 10,
    date: new Date().toISOString(),
    type: 'sale' as const
  };

  const handleBarcodeTest = (barcode: string) => {
    if (!barcode.trim()) return;

    const product = findProductByBarcode(barcode);
    const result = {
      barcode: barcode.trim(),
      found: !!product,
      product: product,
      timestamp: new Date().toLocaleString('ar-IQ')
    };

    setScanResult(result);
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const handleScannerResult = (barcode: string) => {
    setTestBarcode(barcode);
    handleBarcodeTest(barcode);
    setShowScanner(false);
  };

  const clearResults = () => {
    setTestResults([]);
    setScanResult(null);
    setTestBarcode('');
  };

  // Get some existing product barcodes for testing
  const existingBarcodes = products
    .filter(p => p.barcode)
    .slice(0, 5)
    .map(p => ({ name: p.name, barcode: p.barcode }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Scan className="w-6 h-6" />
          اختبار قراءة الباركود
        </h2>

        {/* Manual Barcode Input Test */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختبار قراءة الباركود
            </label>
            <BarcodeInput
              value={testBarcode}
              onChange={setTestBarcode}
              placeholder="أدخل أو امسح الباركود للاختبار"
              readOnlyMode={true}
              allowGeneration={false}
              showGenerator={false}
              onScan={handleBarcodeTest}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleBarcodeTest(testBarcode)}
              disabled={!testBarcode.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              اختبار الباركود
            </button>
            
            <button
              onClick={() => setShowScanner(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Scan className="w-4 h-4" />
              فتح الماسح
            </button>

            <button
              onClick={clearResults}
              className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
            >
              مسح النتائج
            </button>
          </div>
        </div>

        {/* Current Scan Result */}
        {scanResult && (
          <div className={`mt-4 p-4 rounded-lg border ${
            scanResult.found 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {scanResult.found ? (
                <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 mt-1" />
              )}
              
              <div className="flex-1">
                <h4 className={`font-medium ${
                  scanResult.found ? 'text-green-800' : 'text-red-800'
                }`}>
                  {scanResult.found ? 'تم العثور على المنتج!' : 'لم يتم العثور على المنتج'}
                </h4>
                
                <p className="text-sm mt-1">
                  <span className="font-medium">الباركود:</span> {scanResult.barcode}
                </p>
                
                {scanResult.product && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="font-medium">اسم المنتج:</span> {scanResult.product.name}</p>
                    <p><span className="font-medium">التصنيف:</span> {scanResult.product.category}</p>
                    <p><span className="font-medium">الكمية:</span> {scanResult.product.quantity}</p>
                    <p><span className="font-medium">السعر:</span> {scanResult.product.sellingPrice.toLocaleString()} د.ع</p>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  وقت الاختبار: {scanResult.timestamp}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Existing Barcodes for Testing */}
        {existingBarcodes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">باركودات موجودة للاختبار</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {existingBarcodes.map((item, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-600 font-mono">{item.barcode}</p>
                  <button
                    onClick={() => {
                      setTestBarcode(item.barcode || '');
                      handleBarcodeTest(item.barcode || '');
                    }}
                    className="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    اختبار هذا الباركود
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Results History */}
        {testResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">سجل الاختبارات</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className={`p-3 rounded-lg text-sm ${
                  result.found 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono">{result.barcode}</span>
                    <span className={`text-xs ${
                      result.found ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.found ? '✓ موجود' : '✗ غير موجود'}
                    </span>
                  </div>
                  {result.product && (
                    <p className="text-xs text-gray-600 mt-1">{result.product.name}</p>
                  )}
                  <p className="text-xs text-gray-500">{result.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Print Test Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Printer className="w-6 h-6" />
          اختبار طباعة الطلبات
        </h3>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            اختبر وظيفة طباعة الطلبات مع بيانات تجريبية
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">الطلب التجريبي:</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">رقم الطلب:</span> {sampleOrder.id}</p>
              <p><span className="font-medium">عدد الأصناف:</span> {sampleOrder.items.length}</p>
              <p><span className="font-medium">إجمالي القطع:</span> {sampleOrder.totalItems}</p>
              <p><span className="font-medium">المبلغ الإجمالي:</span> {sampleOrder.totalAmount.toLocaleString()} د.ع</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowPrintTest(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            اختبار الطباعة
          </button>
        </div>
      </div>

      {/* Scanner Modal */}
      <BarcodeScanner
        isOpen={showScanner}
        onBarcodeDetected={handleScannerResult}
        onClose={() => setShowScanner(false)}
        title="اختبار مسح الباركود"
      />

      {/* Print Test Modal */}
      {showPrintTest && (
        <PrintOrder
          orderData={sampleOrder}
          isOpen={showPrintTest}
          onClose={() => setShowPrintTest(false)}
        />
      )}
    </div>
  );
}