import { useEffect, useRef, useState, useCallback } from 'react';
import Quagga from 'quagga';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
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
  const [detectedBarcode, setDetectedBarcode] = useState('');
  const [currentLibrary, setCurrentLibrary] = useState<ScannerLibrary>('quagga');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isQuaggaStarted, setIsQuaggaStarted] = useState(false);

  const stopAllStreams = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (currentLibrary === 'quagga' && isQuaggaStarted) {
      try {
        Quagga.stop();
        setIsQuaggaStarted(false);
      } catch (err) {
        console.error('Error stopping Quagga:', err);
      }
    } else if (currentLibrary === 'zxing' && zxingReaderRef.current) {
      zxingReaderRef.current.stopContinuousDecode();
      zxingReaderRef.current = null;
    }
  }, [stream, currentLibrary, isQuaggaStarted]);

  const getAvailableCameras = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
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

  const requestCameraPermission = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          ...(selectedDevice && { deviceId: { exact: selectedDevice } })
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(stream);
      return true;
    } catch (err: any) {
      console.error('Camera permission error:', err);
      
      let errorMessage = 'خطأ في الوصول إلى الكاميرا';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'تم رفض إذن الكاميرا. يرجى السماح بالوصول إلى الكاميرا';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'لم يتم العثور على كاميرا متصلة';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'المتصفح لا يدعم الوصول إلى الكاميرا';
      } else if (location.protocol !== 'https:') {
        errorMessage = 'يجب استخدام اتصال آمن (HTTPS) للوصول إلى الكاميرا';
      }
      
      setError(errorMessage);
      return false;
    }
  };

  const startQuaggaScanner = async () => {
    try {
      if (!scannerRef.current) return false;

      if (isQuaggaStarted) {
        Quagga.stop();
        setIsQuaggaStarted(false);
      }

      const config = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: { min: 640, ideal: 1280 },
            height: { min: 480, ideal: 720 },
            facingMode: "environment",
            ...(selectedDevice && { deviceId: selectedDevice })
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency || 2,
        decoder: {
          readers: ["code_128_reader", "ean_reader", "ean_8_reader"]
        },
        locate: true
      };

      await new Promise<void>((resolve, reject) => {
        Quagga.init(config, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      Quagga.start();
      setIsQuaggaStarted(true);

      Quagga.onDetected((result) => {
        const code = result.codeResult?.code?.trim();
        if (code && code.length >= 3 && code !== detectedBarcode) {
          handleSuccessfulScan(code);
        }
      });

      return true;
    } catch (err) {
      console.error('Quagga initialization error:', err);
      return false;
    }
  };

  const startZXingScanner = async () => {
    try {
      if (!videoRef.current) return false;

      // Clear previous instance
      if (zxingReaderRef.current) {
        zxingReaderRef.current.stopContinuousDecode();
        zxingReaderRef.current = null;
      }

      const reader = new BrowserMultiFormatReader();
      zxingReaderRef.current = reader;

      const constraints = {
        video: {
          facingMode: 'environment',
          ...(selectedDevice && { deviceId: { exact: selectedDevice } })
        }
      };

      // Get video stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(stream);

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          throw err;
        });
      }

      // Start decoding
      reader.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result, err) => {
          if (result) {
            const code = result.getText().trim();
            if (code && code !== detectedBarcode) {
              handleSuccessfulScan(code);
            }
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error('ZXing error:', err);
          }
        }
      );

      return true;
    } catch (err) {
      console.error('ZXing initialization error:', err);
      return false;
    }
  };

  const handleSuccessfulScan = (barcode: string) => {
    setDetectedBarcode(barcode);
    onBarcodeDetected(barcode);
    
    if (navigator.vibrate) navigator.vibrate(200);
    setTimeout(onClose, 500);
  };

  const startScanner = async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setError(null);
    setDetectedBarcode('');

    if (!await requestCameraPermission()) {
      setIsInitializing(false);
      return;
    }

    setIsScanning(true);

    let success = await (currentLibrary === 'quagga' 
      ? startQuaggaScanner() 
      : startZXingScanner());

    if (!success) {
      const fallbackLibrary = currentLibrary === 'quagga' ? 'zxing' : 'quagga';
      setCurrentLibrary(fallbackLibrary);
      success = await (fallbackLibrary === 'quagga' 
        ? startQuaggaScanner() 
        : startZXingScanner());
    }

    if (!success) {
      setError('فشل في تشغيل الماسح. تأكد من الإذن والاتصال الآمن (HTTPS).');
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

    return stopAllStreams;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isScanning && !error && !isInitializing) {
      startScanner();
    }
  }, [selectedDevice]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
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
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

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

        <div className="relative">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4 font-medium">{error}</p>
              <button
                onClick={startScanner}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 flex items-center gap-2 mx-auto"
              >
                <RefreshCcw className="w-4 h-4" />
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              {currentLibrary === 'quagga' ? (
                <div ref={scannerRef} className="w-full h-80 flex items-center justify-center">
                  {!isScanning && (
                    <div className="text-white text-center">
                      <ScanLine className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                      <p>{isInitializing ? 'جاري تحضير الماسح...' : 'جاري تهيئة الماسح'}</p>
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
              
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-green-400 rounded-lg">
                    {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([vert, horiz]) => (
                      <div 
                        key={`${vert}-${horiz}`}
                        className={`absolute ${vert}-0 ${horiz}-0 w-8 h-8 border-${vert[0]}-4 border-${horiz[0]}-4 border-green-400`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 text-center text-gray-600">
            <p className="text-sm">وجه الكاميرا نحو الباركود مع توفر إضاءة جيدة</p>
            {detectedBarcode && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">تم المسح: {detectedBarcode}</p>
              </div>
            )}
          </div>
        </div>

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