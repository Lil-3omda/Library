import React, { useState } from 'react';
import { Camera, Scan, RefreshCw } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';

interface BarcodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showScanner?: boolean;
  showGenerator?: boolean;
  onScan?: (barcode: string) => void;
  allowGeneration?: boolean;
  onBarcodeExists?: (product: any) => void;
  checkExistingBarcode?: (barcode: string) => any;
  readOnlyMode?: boolean; // New prop for testing mode
}

export function BarcodeInput({
  value,
  onChange,
  placeholder = "أدخل الباركود أو امسحه",
  disabled = false,
  showScanner = true,
  showGenerator = true,
  onScan,
  allowGeneration = true,
  onBarcodeExists,
  checkExistingBarcode,
  readOnlyMode = false
}: BarcodeInputProps) {
  const [showScannerModal, setShowScannerModal] = useState(false);

  const handleBarcodeDetected = (barcode: string) => {
    // In read-only mode, just display the scanned barcode
    if (readOnlyMode) {
      onChange(barcode);
      if (onScan) {
        onScan(barcode);
      }
      setShowScannerModal(false);
      return;
    }
    
    // Check if barcode exists before setting value
    if (checkExistingBarcode) {
      const existingProduct = checkExistingBarcode(barcode);
      if (existingProduct && onBarcodeExists) {
        onBarcodeExists(existingProduct);
        setShowScannerModal(false);
        return;
      }
    }
    
    onChange(barcode);
    if (onScan) {
      onScan(barcode);
    }
    setShowScannerModal(false);
  };

  const handleManualInput = (inputValue: string) => {
    if (readOnlyMode) {
      onChange(inputValue);
      return;
    }
    
    if (checkExistingBarcode && inputValue.trim()) {
      const existingProduct = checkExistingBarcode(inputValue.trim());
      if (existingProduct && onBarcodeExists) {
        onBarcodeExists(existingProduct);
        return;
      }
    }
    onChange(inputValue);
  };

  const generateBarcode = () => {
    if (!allowGeneration || readOnlyMode) return;
    
    // Generate a simple random barcode
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const generatedBarcode = `${timestamp.slice(-6)}${random}`;
    onChange(generatedBarcode);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => handleManualInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-20"
          onBlur={(e) => {
            const inputValue = e.target.value.trim();
            if (inputValue && checkExistingBarcode) {
              const existingProduct = checkExistingBarcode(inputValue);
              if (existingProduct && onBarcodeExists) {
                onBarcodeExists(existingProduct);
              }
            }
          }}
        />
        
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          {showScanner && (
            <button
              type="button"
              onClick={() => setShowScannerModal(true)}
              disabled={disabled}
              className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="مسح الباركود"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}
          
          {showGenerator && allowGeneration && (
            <button
              type="button"
              onClick={generateBarcode}
              disabled={disabled || readOnlyMode}
              className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="توليد باركود"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>
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