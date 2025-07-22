import { useState, useEffect, useCallback } from 'react';

export interface CameraDevice {
  deviceId: string;
  label: string;
  kind: 'videoinput';
}

export interface CameraPermissionState {
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  devices: CameraDevice[];
  selectedDevice: string;
}

export function useCameraPermission() {
  const [state, setState] = useState<CameraPermissionState>({
    hasPermission: false,
    isLoading: false,
    error: null,
    devices: [],
    selectedDevice: ''
  });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request basic camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());

      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices: CameraDevice[] = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `كاميرا ${device.deviceId.slice(0, 8)}`,
          kind: 'videoinput'
        }));

      // Select back camera by default
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('environment') ||
        device.label.toLowerCase().includes('خلف')
      );

      setState({
        hasPermission: true,
        isLoading: false,
        error: null,
        devices: videoDevices,
        selectedDevice: backCamera?.deviceId || videoDevices[0]?.deviceId || ''
      });

      return true;

    } catch (err: any) {
      let errorMessage = 'خطأ غير معروف في الوصول إلى الكاميرا';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'تم رفض إذن الكاميرا. يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'لم يتم العثور على كاميرا. تأكد من وجود كاميرا متصلة بالجهاز.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'متصفحك لا يدعم الوصول إلى الكاميرا. يرجى استخدام متصفح حديث.';
      } else if (err.name === 'NotSecureError' || location.protocol !== 'https:') {
        errorMessage = 'يجب استخدام اتصال آمن (HTTPS) للوصول إلى الكاميرا.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setState({
        hasPermission: false,
        isLoading: false,
        error: errorMessage,
        devices: [],
        selectedDevice: ''
      });

      return false;
    }
  }, []);

  const setSelectedDevice = useCallback((deviceId: string) => {
    setState(prev => ({ ...prev, selectedDevice: deviceId }));
  }, []);

  const reset = useCallback(() => {
    setState({
      hasPermission: false,
      isLoading: false,
      error: null,
      devices: [],
      selectedDevice: ''
    });
  }, []);

  // Check for camera support on mount
  useEffect(() => {
    const checkCameraSupport = () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setState(prev => ({
          ...prev,
          error: 'متصفحك لا يدعم الوصول إلى الكاميرا. يرجى استخدام متصفح حديث.'
        }));
      }
    };

    checkCameraSupport();
  }, []);

  return {
    ...state,
    requestPermission,
    setSelectedDevice,
    reset
  };
}