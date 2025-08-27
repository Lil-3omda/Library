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
          label="Scanner Input (Panzer USB Scanner)"
          placeholder="Focus here and scan barcode..."
        />
      </div>

      {/* Test Mode */}
      {showTestMode && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Test Mode
            </h4>
            <button
              onClick={() => setShowTest(!showTest)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showTest ? 'Hide' : 'Show'} Test Options
            </button>
          </div>

          {showTest && (
            <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
              {/* Custom barcode test */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Custom Barcode Test:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testBarcode}
                    onChange={(e) => setTestBarcode(e.target.value)}
                    placeholder="Enter test barcode"
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    onKeyPress={(e) => e.key === 'Enter' && handleTestScan()}
                  />
                  <button
                    onClick={handleTestScan}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Simulate Scan
                  </button>
                </div>
              </div>

              {/* Mock barcodes */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">Sample Book Barcodes:</label>
                <div className="grid grid-cols-1 gap-1">
                  {mockBarcodes.map((book) => (
                    <button
                      key={book.code}
                      onClick={() => simulateScan(book.code)}
                      className="text-left p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 text-xs transition-colors"
                    >
                      <div className="font-mono text-blue-600">{book.code}</div>
                      <div className="text-gray-600 truncate">{book.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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