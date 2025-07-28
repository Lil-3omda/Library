import React, { useEffect, useRef } from 'react';
import { Download, RefreshCw } from 'lucide-react';

interface BarcodeGeneratorProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  format?: 'CODE128' | 'EAN13' | 'EAN8' | 'UPC';
  onGenerate?: (barcode: string) => void;
}

export function BarcodeGenerator({ 
  value, 
  width = 200, 
  height = 100, 
  displayValue = true,
  format = 'CODE128',
  onGenerate 
}: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate a random barcode
  const generateRandomBarcode = () => {
    if (!onGenerate) return;
    
    let newBarcode = '';
    
    switch (format) {
      case 'EAN13':
        // Generate 13 digit EAN barcode
        newBarcode = '2' + Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
        break;
      case 'EAN8':
        // Generate 8 digit EAN barcode
        newBarcode = '2' + Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('');
        break;
      case 'UPC':
        // Generate 12 digit UPC barcode
        newBarcode = '0' + Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
        break;
      default:
        // Generate alphanumeric CODE128 barcode
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        newBarcode = `${timestamp.slice(-8)}${random}`;
    }
    
    onGenerate(newBarcode);
  };

  // Simple barcode renderer (basic implementation)
  useEffect(() => {
    if (canvasRef.current && value) {
      drawBarcode();
    }
  }, [value, width, height, displayValue, format]);

  const drawBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simple barcode pattern (for demonstration)
    const barWidth = width / (value.length * 2);
    const barHeight = displayValue ? height - 20 : height;

    ctx.fillStyle = 'black';
    
    // Draw bars based on value
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      const charCode = char.charCodeAt(0);
      
      // Create pattern based on character
      const pattern = charCode % 2 === 0 ? [1, 0, 1, 1] : [1, 1, 0, 1];
      
      for (let j = 0; j < pattern.length; j++) {
        if (pattern[j] === 1) {
          const x = (i * pattern.length + j) * barWidth;
          ctx.fillRect(x, 0, barWidth, barHeight);
        }
      }
    }

    // Draw text if enabled
    if (displayValue) {
      ctx.fillStyle = 'black';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(value, width / 2, height - 5);
    }
  };

  const downloadBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `barcode_${value}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">مولد الباركود</h3>
        <div className="flex gap-2">
          <button
            onClick={generateRandomBarcode}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            <RefreshCw className="w-4 h-4" />
            توليد جديد
          </button>
          {value && (
            <button
              onClick={downloadBarcode}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
            >
              <Download className="w-4 h-4" />
              تحميل
            </button>
          )}
        </div>
      </div>
      
      {value ? (
        <div className="text-center">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="border border-gray-300 rounded mx-auto"
          />
          <p className="mt-2 text-sm text-gray-600">الباركود: {value}</p>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>لا يوجد باركود للعرض</p>
          <button
            onClick={generateRandomBarcode}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            توليد باركود جديد
          </button>
        </div>
      )}
    </div>
  );
}