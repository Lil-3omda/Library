// BarcodeLookup.tsx
import React, { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';

interface BarcodeLookupProps {
  onBarcodeScanned: (barcode: string) => void;
}

export function BarcodeLookup({ 
  onBarcodeScanned
}: BarcodeLookupProps) {
  const [showScanner, setShowScanner] = useState(false);

  const handleBarcodeDetected = (barcode: string) => {
    onBarcodeScanned(barcode);
    setShowScanner(false);
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

      <BarcodeScanner
        isOpen={showScanner}
        onBarcodeDetected={handleBarcodeDetected}
        onClose={() => setShowScanner(false)}
        title="البحث عن منتج بالباركود"
      />
    </div>
  );
}