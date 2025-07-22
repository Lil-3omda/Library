export interface CameraConstraints {
  video: {
    facingMode?: string;
    width?: { ideal: number; min?: number; max?: number };
    height?: { ideal: number; min?: number; max?: number };
    deviceId?: { exact: string } | string;
    frameRate?: { ideal: number };
  };
}

export const createCameraConstraints = (
  deviceId?: string,
  facingMode: 'user' | 'environment' = 'environment'
): CameraConstraints => {
  const constraints: CameraConstraints = {
    video: {
      facingMode,
      width: { ideal: 1280, min: 640, max: 1920 },
      height: { ideal: 720, min: 480, max: 1080 },
      frameRate: { ideal: 30 }
    }
  };

  if (deviceId) {
    constraints.video.deviceId = { exact: deviceId };
    // Remove facingMode when using specific device
    delete constraints.video.facingMode;
  }

  return constraints;
};

export const isCameraSupported = (): boolean => {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
};

export const isSecureContext = (): boolean => {
  return location.protocol === 'https:' || location.hostname === 'localhost';
};

export const getCameraErrorMessage = (error: any): string => {
  if (!error || typeof error !== 'object') {
    return 'خطأ غير معروف في الكاميرا';
  }

  const errorName = error.name || '';
  const errorMessage = error.message || '';

  switch (errorName) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'تم رفض إذن الكاميرا. يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح.';
    
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'لم يتم العثور على كاميرا. تأكد من وجود كاميرا متصلة بالجهاز.';
    
    case 'NotSupportedError':
      return 'متصفحك لا يدعم الوصول إلى الكاميرا. يرجى استخدام متصفح حديث.';
    
    case 'NotSecureError':
      return 'يجب استخدام اتصال آمن (HTTPS) للوصول إلى الكاميرا.';
    
    case 'NotReadableError':
    case 'TrackStartError':
      return 'الكاميرا مستخدمة من تطبيق آخر. أغلق التطبيقات الأخرى وحاول مرة أخرى.';
    
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return 'إعدادات الكاميرا غير متوافقة. جرب كاميرا أخرى.';
    
    case 'TypeError':
      if (errorMessage.includes('getUserMedia')) {
        return 'متصفحك لا يدعم الوصول إلى الكاميرا.';
      }
      break;
    
    case 'AbortError':
      return 'تم إلغاء العملية. حاول مرة أخرى.';
  }

  // Check for security context
  if (!isSecureContext()) {
    return 'يجب استخدام اتصال آمن (HTTPS) للوصول إلى الكاميرا.';
  }

  // Fallback with original error message if available
  if (errorMessage) {
    return `خطأ في الكاميرا: ${errorMessage}`;
  }

  return 'خطأ غير معروف في الكاميرا';
};

export const detectBestCamera = (devices: MediaDeviceInfo[]): string => {
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  
  if (videoDevices.length === 0) {
    return '';
  }

  // Look for back camera keywords in different languages
  const backCameraKeywords = [
    'back', 'rear', 'environment', 'facing back',
    'خلف', 'خلفية', 'back camera'
  ];

  const backCamera = videoDevices.find(device => {
    const label = device.label.toLowerCase();
    return backCameraKeywords.some(keyword => label.includes(keyword.toLowerCase()));
  });

  return backCamera?.deviceId || videoDevices[0].deviceId;
};

export const vibrate = (pattern: number | number[] = 200): void => {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      // Vibration not supported or failed
      console.debug('Vibration not supported:', error);
    }
  }
};

export const playBeep = (): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    // Audio not supported
    console.debug('Audio beep not supported:', error);
  }
};