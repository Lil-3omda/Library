import React, { useRef } from 'react';
import { Download, Upload, Database, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function DataManagement() {
  const { exportToJSON, importFromJSON, products, sales, categories } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        importFromJSON(jsonData);
        alert('تم استيراد البيانات بنجاح!');
      } catch (error) {
        alert('خطأ في قراءة الملف. تأكد من أن الملف بصيغة JSON صحيحة.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadJSONFile = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportProducts = () => {
    const data = {
      products: products,
      lastUpdated: new Date().toISOString()
    };
    downloadJSONFile(data, `products_${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportSales = () => {
    const data = {
      sales: sales,
      lastUpdated: new Date().toISOString()
    };
    downloadJSONFile(data, `sales_${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportCategories = () => {
    const data = {
      categories: categories,
      lastUpdated: new Date().toISOString()
    };
    downloadJSONFile(data, `categories_${new Date().toISOString().split('T')[0]}.json`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-6 h-6" />
          إدارة البيانات
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">تصدير البيانات</h3>
            
            <div className="space-y-3">
              <button
                onClick={exportToJSON}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                تصدير جميع البيانات
              </button>
              
              <button
                onClick={exportProducts}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                تصدير المنتجات فقط
              </button>
              
              <button
                onClick={exportSales}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                تصدير المبيعات فقط
              </button>
              
              <button
                onClick={exportCategories}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                تصدير التصنيفات فقط
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">استيراد البيانات</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors mx-auto"
              >
                <Upload className="w-4 h-4" />
                اختيار ملف JSON
              </button>
              <p className="text-sm text-gray-500 mt-2">
                اختر ملف JSON لاستيراد البيانات
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>تنبيه:</strong> استيراد البيانات سيستبدل البيانات الحالية. تأكد من عمل نسخة احتياطية أولاً.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">إحصائيات البيانات</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{products.length}</div>
            <div className="text-sm text-blue-800">المنتجات</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{sales.length}</div>
            <div className="text-sm text-green-800">المبيعات</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
            <div className="text-sm text-purple-800">التصنيفات</div>
          </div>
        </div>
      </div>
    </div>
  );
}