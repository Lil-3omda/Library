import React, { useState } from 'react';
import { Scan, TestTube, Keyboard } from 'lucide-react';
import { USBBarcodeInput } from './USBBarcodeInput';

interface BarcodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onScan?: (barcode: string) => void;
  autoFocus?: boolean;
  label?: string;
  showTestMode?: boolean;
}

export function BarcodeInput({
  value,
  onChange,
  placeholder = "Enter barcode or scan it",
  disabled = false,
  onScan,
  autoFocus = false,
  label,
  showTestMode = true,
}: BarcodeInputProps) {
  const [testBarcode, setTestBarcode] = useState('');
  const [showTest, setShowTest] = useState(false);
  
  // Mock barcodes for testing
  const mockBarcodes = [
    { code: '9780140449136', title: 'The Odyssey by Homer' },
    { code: '9780061120084', title: 'To Kill a Mockingbird by Harper Lee' },
    { code: '9780451524935', title: '1984 by George Orwell' },
    { code: '9780743273565', title: 'The Great Gatsby by F. Scott Fitzgerald' },
    { code: '9780547928227', title: 'The Hobbit by J.R.R. Tolkien' },
  ];

  const handleBarcodeScanned = (barcode: string) => {
    onChange(barcode);
    if (onScan) {
      onScan(barcode);
    }
  };

  const simulateScan = (mockCode: string) => {
    handleBarcodeScanned(mockCode);
    setShowTest(false);
  };

  const handleTestScan = () => {
    if (testBarcode.trim()) {
      handleBarcodeScanned(testBarcode.trim());
      setTestBarcode('');
      setShowTest(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Manual input field */}
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Keyboard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* USB Scanner input */}
      <div className="border-t pt-4">
        <USBBarcodeInput
          onBarcodeScanned={handleBarcodeScanned}
          autoFocus={autoFocus}
          label="مدخل الماسح (ماسح Panzer USB)"
          placeholder="ركز هنا وامسح الباركود..."
        />
      </div>



      {/* Current value display */}
      {value && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
          <Scan className="w-4 h-4" />
          <span>Scanned: <strong>{value}</strong></span>
        </div>
      )}
    </div>
  );
}