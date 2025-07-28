import React, { useEffect, useRef, useState, useCallback } from 'react';
import Quagga from 'quagga';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Camera, X, ScanLine, Settings, RefreshCcw, AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
  title?: string;
}

type ScannerLibrary = 'quagga' | 'zxing';

export function BarcodeScanner({ 
  onBarcodeDetected, 
  onClose, 
  isOpen, 
  title = "مسح الباركود" 
}: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedBarcode, setDetectedBarcode] = useState<string>('');
  const [currentLibrary, setCurrentLibrary] = useState<ScannerLibrary>('quagga');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const stopAllStreams = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (currentLibrary === 'quagga') {
      try {
        if (Quagga && typeof Quagga.stop === 'function') {
          Quagga.stop();
        }
      } catch (err) {
        console.error('Error stopping Quagga:', err);
      }
    } else if (currentLibrary === 'zxing' && zxingReaderRef.current) {
      try {
        zxingReaderRef.current.reset();
      } catch (err) {
        console.error('Error stopping ZXing:', err);
      }
    }
  }, [stream, currentLibrary]);

  const getAvailableCameras = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      // Select back camera by default
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('environment')
      );
      setSelectedDevice(backCamera?.deviceId || videoDevices[0]?.deviceId || '');
    } catch (err) {
      console.error('Error getting cameras:', err);
      setError('فشل في الوصول إلى الكاميرات المتاحة');
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      if (selectedDevice) {
        constraints.video = {
          ...constraints.video,
          deviceId: { exact: selectedDevice }
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(stream);
      return true;
    } catch (err: any) {
      console.error('Camera permission error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('تم رفض إذن الكاميرا. يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('لم يتم العثور على كاميرا. تأكد من وجود كاميرا متصلة بالجهاز.');
      } else if (err.name === 'NotSupportedError') {
        setError('متصفحك لا يدعم الوصول إلى الكاميرا. يرجى استخدام متصفح حديث.');
      } else if (err.name === 'NotSecureError' || location.protocol !== 'https:') {
        setError('يجب استخدام اتصال آمن (HTTPS) للوصول إلى الكاميرا.');
      } else {
        setError('خطأ في الوصول إلى الكاميرا: ' + (err.message || 'خطأ غير معروف'));
      }
      return false;
    }
  };

  const startQuaggaScanner = async (): Promise<boolean> => {
    try {
      if (!scannerRef.current) return false;

      const config = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: { min: 640, ideal: 1280 },
            height: { min: 480, ideal: 720 },
            facingMode: "environment"
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency || 2,
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
      };

      if (selectedDevice) {
        config.inputStream.constraints.deviceId = selectedDevice;
      }

      await Quagga.init(config);
      Quagga.start();

      Quagga.onDetected((result) => {
        const code = result.codeResult.code;
        // Clean and validate the detected code
        const cleanCode = code ? code.trim() : '';
        if (cleanCode && cleanCode !== detectedBarcode && cleanCode.length >= 3) {
          setDetectedBarcode(cleanCode);
          onBarcodeDetected(cleanCode);
          
          // Vibrate if supported
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
          
          // Auto close after successful scan
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      });

      return true;
    } catch (err) {
      console.error('Quagga initialization error:', err);
      return false;
    }
  };

  const startZXingScanner = async (): Promise<boolean> => {
    try {
      if (!videoRef.current) return false;

      const reader = new BrowserMultiFormatReader();
      zxingReaderRef.current = reader;

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      if (selectedDevice) {
        constraints.video.deviceId = { exact: selectedDevice };
      }

      await reader.decodeFromConstraints(constraints, videoRef.current, (result, error) => {
        if (result) {
          const code = result.getText();
          // Clean and validate the detected code
          const cleanCode = code ? code.trim() : '';
          if (cleanCode && cleanCode !== detectedBarcode && cleanCode.length >= 3) {
            setDetectedBarcode(cleanCode);
            onBarcodeDetected(cleanCode);
            
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
            
            setTimeout(() => {
              onClose();
            }, 1500);
          }
        }
        
        if (error && error.name !== 'NotFoundException') {
          console.error('ZXing scanning error:', error);
        }
      });

      return true;
    } catch (err) {
      console.error('ZXing initialization error:', err);
      return false;
    }
  };

  const startScanner = async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setError(null);
    setDetectedBarcode('');

    // Check camera permission first
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      setIsInitializing(false);
      return;
    }

    setIsScanning(true);

    let success = false;
    
    // Try Quagga first
    if (currentLibrary === 'quagga') {
      success = await startQuaggaScanner();
      if (!success) {
        console.log('Quagga failed, trying ZXing...');
        setCurrentLibrary('zxing');
        success = await startZXingScanner();
      }
    } else {
      // Try ZXing first
      success = await startZXingScanner();
      if (!success) {
        console.log('ZXing failed, trying Quagga...');
        setCurrentLibrary('quagga');
        success = await startQuaggaScanner();
      }
    }

    if (!success) {
      setError('فشل في تشغيل ماسح الباركود. تأكد من إعطاء الإذن للوصول إلى الكاميرا والاتصال بشبكة آمنة (HTTPS).');
      setIsScanning(false);
    }

    setIsInitializing(false);
  };

  const switchLibrary = () => {
    stopAllStreams();
    setCurrentLibrary(prev => prev === 'quagga' ? 'zxing' : 'quagga');
    setIsScanning(false);
    setError(null);
  };

  useEffect(() => {
    if (isOpen) {
      getAvailableCameras();
    } else {
      stopAllStreams();
      setIsScanning(false);
      setError(null);
      setDetectedBarcode('');
    }

    return () => {
      stopAllStreams();
    };
  }, [isOpen, stopAllStreams]);

  useEffect(() => {
    if (isOpen && !isScanning && !error && !isInitializing) {
      startScanner();
    }
  }, [selectedDevice]);



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-6 h-6" />
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={switchLibrary}
              className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded"
              title="تبديل مكتبة المسح"
            >
              <Settings className="w-3 h-3" />
              {currentLibrary === 'quagga' ? 'Quagga' : 'ZXing'}
            </button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Camera Selection */}
        {devices.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختيار الكاميرا:
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `كاميرا ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Scanner Area */}
        <div className="relative">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4 font-medium">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={startScanner}
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 flex items-center gap-2 mx-auto"
                >
                  <RefreshCcw className="w-4 h-4" />
                  إعادة المحاولة
                </button>
                <div className="text-sm text-gray-600">
                  <p>نصائح لحل المشكلة:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>تأكد من السماح بالوصول إلى الكاميرا في المتصفح</li>
                    <li>استخدم اتصال آمن (HTTPS)</li>
                    <li>أعد تحميل الصفحة وحاول مرة أخرى</li>
                    <li>تأكد من عدم استخدام الكاميرا من تطبيق آخر</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              {currentLibrary === 'quagga' ? (
                <div
                  ref={scannerRef}
                  className="w-full h-80 flex items-center justify-center"
                >
                  {!isScanning && (
                    <div className="text-white text-center">
                      <ScanLine className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                      <p>{isInitializing ? 'جاري تحضير الماسح...' : 'اضغط إعادة المحاولة لبدء المسح'}</p>
                    </div>
                  )}
                </div>
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-80 object-cover"
                  autoPlay
                  playsInline
                  muted
                />
              )}
              
              {/* Scanning overlay */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-green-400 rounded-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>
                  </div>
                  
                  {/* Scanning line animation */}
                  <div className="absolute top-1/2 left-8 right-8 h-1 bg-green-400 animate-pulse transform -translate-y-1/2"></div>
                  
                  {/* Library indicator */}
                  <div className="absolute top-4 left-4 bg-green-600 text-white px-2 py-1 rounded text-xs">
                    {currentLibrary === 'quagga' ? 'Quagga Scanner' : 'ZXing Scanner'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 text-center text-gray-600">
            <p className="text-sm">
              وجه الكاميرا نحو الباركود وتأكد من وضوح الصورة والإضاءة الجيدة
            </p>
            {detectedBarcode && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✅ تم اكتشاف: {detectedBarcode}</p>
                <p className="text-green-600 text-sm">سيتم إغلاق النافذة تلقائياً...</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-4 mt-6">
          <button
            onClick={switchLibrary}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
            تبديل المحرك
          </button>
          
          <div className="flex gap-2">
            {!isScanning && !error && (
              <button
                onClick={startScanner}
                disabled={isInitializing}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isInitializing ? 'جاري التحضير...' : 'بدء المسح'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}