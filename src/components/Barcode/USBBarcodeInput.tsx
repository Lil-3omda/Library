import React, { useState, useRef, useEffect } from 'react';
import { Scan, Keyboard, Search } from 'lucide-react';

interface USBBarcodeInputProps {
  onBarcodeScanned: (barcode: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  label?: string;
  showIcon?: boolean;
}

export function USBBarcodeInput({
  onBarcodeScanned,
  placeholder = "ضع المؤشر هنا وامسح الباركود",
  autoFocus = false,
  className = "",
  label = "مسح الباركود",
  showIcon = true
}: USBBarcodeInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-focus the input when component mounts
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Indicate scanning is in progress
    setIsScanning(true);
    setLastScanTime(Date.now());

    // Clear any existing timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // Set timeout to detect end of scanning (no input for 100ms)
    scanTimeoutRef.current = setTimeout(() => {
      setIsScanning(false);
    }, 100);
  };

  // Handle key press events
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // When Enter is pressed (scanner typically sends Enter after barcode)
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      processBarcodeInput(inputValue.trim());
    }
  };

  // Handle key down for immediate processing of certain keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Some scanners might use different line endings
    if ((e.key === 'Enter' || e.key === 'Tab') && inputValue.trim()) {
      e.preventDefault();
      processBarcodeInput(inputValue.trim());
    }
  };

  // Process the scanned barcode
  const processBarcodeInput = (barcode: string) => {
    if (barcode.length >= 3) { // Minimum barcode length
      onBarcodeScanned(barcode);
      
      // Clear input for next scan
      setInputValue('');
      setIsScanning(false);
      
      // Refocus input for next scan
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // Handle input blur - refocus automatically
  const handleBlur = () => {
    // Auto-refocus after a short delay to keep input ready for scanning
    setTimeout(() => {
      if (inputRef.current && !document.activeElement?.closest('.modal')) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Manual trigger for testing
  const handleManualSubmit = () => {
    if (inputValue.trim()) {
      processBarcodeInput(inputValue.trim());
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            showIcon ? 'pr-10' : ''
          } ${isScanning ? 'border-green-400 bg-green-50' : ''}`}
          autoComplete="off"
          spellCheck={false}
        />
        
        {showIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {isScanning ? (
              <Scan className="w-5 h-5 text-green-600 animate-pulse" />
            ) : (
              <Keyboard className="w-5 h-5 text-gray-400" />
            )}
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isScanning ? (
            <span className="text-green-600 flex items-center gap-1">
              <Scan className="w-4 h-4" />
              جاري المسح...
            </span>
          ) : (
            <span className="text-gray-500 flex items-center gap-1">
              <Keyboard className="w-4 h-4" />
              جاهز للمسح
            </span>
          )}
        </div>
        
        {inputValue && (
          <button
            onClick={handleManualSubmit}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            title="بحث يدوي"
          >
            <Search className="w-4 h-4" />
            بحث
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <p>• ضع المؤشر في الحقل أعلاه</p>
        <p>• امسح الباركود باستخدام الماسح</p>
        <p>• سيتم البحث تلقائياً بعد المسح</p>
      </div>
    </div>
  );
}