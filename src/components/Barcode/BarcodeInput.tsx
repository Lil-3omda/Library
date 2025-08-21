import React from 'react';
import { Scan } from 'lucide-react';
import { USBBarcodeInput } from './USBBarcodeInput';

interface BarcodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onScan?: (barcode: string) => void;
  autoFocus?: boolean;
  label?: string;
}

export function BarcodeInput({
  value,
  onChange,
  placeholder = "أدخل الباركود أو امسحه",
  disabled = false,
  onScan,
  autoFocus = false,
  label,
}: BarcodeInputProps) {
  const handleBarcodeScanned = (barcode: string) => {
    onChange(barcode);
    if (onScan) {
      onScan(barcode);
    }
  };

  return (
    <div className="space-y-2">
      {/* Manual input field */}
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* USB Scanner input */}
      <div className="border-t pt-4">
        <USBBarcodeInput
          onBarcodeScanned={handleBarcodeScanned}
          autoFocus={autoFocus}
          label="مسح بالماسح الضوئي"
        />
      </div>

      {value && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Scan className="w-4 h-4" />
          <span>الباركود: {value}</span>
        </div>
      )}
    </div>
  );
}