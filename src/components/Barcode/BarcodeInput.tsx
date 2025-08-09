// BarcodeInput.tsx
import React, { useState } from 'react';
import { Camera, Scan } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';

interface BarcodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showScanner?: boolean;
  onScan?: (barcode: string) => void;
}

export function BarcodeInput({
  value,
  onChange,
  placeholder = "أدخل الباركود أو امسحه",
  disabled = false,
  showScanner = true,
  onScan,
}: BarcodeInputProps) {
  const [showScannerModal, setShowScannerModal] = useState(false);

  const handleBarcodeDetected = (barcode: string) => {
    onChange(barcode);
    if (onScan) {
      onScan(barcode);
    }
    setShowScannerModal(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-20"
        />
        
        {showScanner && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <button
              type="button"
              onClick={() => setShowScannerModal(true)}
              disabled={disabled}
              className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="مسح الباركود"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {value && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Scan className="w-4 h-4" />
          <span>الباركود: {value}</span>
        </div>
      )}

      <BarcodeScanner
        isOpen={showScannerModal}
        onBarcodeDetected={handleBarcodeDetected}
        onClose={() => setShowScannerModal(false)}
        title="مسح باركود المنتج"
      />
    </div>
  );
}