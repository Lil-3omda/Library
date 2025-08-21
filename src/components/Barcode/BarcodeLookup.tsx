import React from 'react';
import { Search, Package } from 'lucide-react';
import { USBBarcodeInput } from './USBBarcodeInput';

interface BarcodeLookupProps {
  onBarcodeScanned: (barcode: string) => void;
  onProductFound?: (product: any) => void;
  onProductNotFound?: (barcode: string) => void;
  autoOpenSale?: boolean;
}

export function BarcodeLookup({ 
  onBarcodeScanned,
  onProductFound,
  onProductNotFound,
  autoOpenSale = false
}: BarcodeLookupProps) {
  const handleBarcodeScanned = (barcode: string) => {
    onBarcodeScanned(barcode);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Search className="w-5 h-5" />
          البحث بالباركود
        </h3>
      </div>

      <USBBarcodeInput
        onBarcodeScanned={handleBarcodeScanned}
        placeholder="ضع المؤشر هنا وامسح الباركود للبحث"
        autoFocus={true}
        label="مسح الباركود للبحث"
      />
    </div>
  );
}