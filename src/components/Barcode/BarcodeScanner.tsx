import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';
import { Camera, X, ScanLine } from 'lucide-react';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
  title?: string;
}

export function BarcodeScanner({ 
  onBarcodeDetected, 
  onClose, 
  isOpen, 
  title = "مسح الباركود" 
}: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedBarcode, setDetectedBarcode] = useState<string>('');

  useEffect(() => {
    if (isOpen && scannerRef.current) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);

      await Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment" // Use back camera
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: 2,
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader"
          ]
        },
        locate: true
      });

      Quagga.start();

      Quagga.onDetected((result) => {
        const code = result.codeResult.code;
        if (code && code !== detectedBarcode) {
          setDetectedBarcode(code);
          onBarcodeDetected(code);
          
          // Vibrate if supported
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
          
          // Auto close after successful scan
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      });

    } catch (err) {
      console.error('خطأ في تشغيل ماسح الباركود:', err);
      setError('فشل في تشغيل الكاميرا. تأكد من إعطاء الإذن للوصول إلى الكاميرا.');
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    try {
      if (Quagga && typeof Quagga.stop === 'function') {
        Quagga.stop();
      }
      setIsScanning(false);
      setDetectedBarcode('');
    } catch (err) {
      console.error('خطأ في إيقاف ماسح الباركود:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-6 h-6" />
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={startScanner}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <div
                ref={scannerRef}
                className="w-full h-80 flex items-center justify-center"
              >
                {!isScanning && (
                  <div className="text-white text-center">
                    <ScanLine className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                    <p>جاري تحضير الماسح...</p>
                  </div>
                )}
              </div>
              
              {/* Scanning overlay */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-green-400 rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400"></div>
                  </div>
                  
                  {/* Scanning line animation */}
                  <div className="absolute top-8 left-8 right-8 h-0.5 bg-green-400 animate-pulse"></div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 text-center text-gray-600">
            <p className="text-sm">
              وجه الكاميرا نحو الباركود وتأكد من وضوح الصورة
            </p>
            {detectedBarcode && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-medium">تم اكتشاف: {detectedBarcode}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}