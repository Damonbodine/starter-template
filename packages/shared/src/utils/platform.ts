/**
 * Platform detection and utility functions for cross-platform compatibility
 */

/**
 * Detects the current platform
 */
export interface PlatformInfo {
  isWeb: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMacOS: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isNode: boolean;
  isBrowser: boolean;
  userAgent: string;
  platform: string;
}

/**
 * Browser information
 */
export interface BrowserInfo {
  name: string;
  version: string;
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  isOpera: boolean;
  isIE: boolean;
}

/**
 * Device information
 */
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  isRetina: boolean;
}

/**
 * Gets comprehensive platform information
 * @returns Platform information object
 */
export function getPlatformInfo(): PlatformInfo {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  const isNode = typeof process !== 'undefined' && process.versions?.node;
  
  let userAgent = '';
  let platform = '';
  
  if (isBrowser) {
    userAgent = navigator.userAgent || '';
    platform = navigator.platform || '';
  } else if (isNode) {
    platform = process.platform;
  }
  
  const userAgentLower = userAgent.toLowerCase();
  const platformLower = platform.toLowerCase();
  
  // Mobile detection
  const isMobile = isBrowser && (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
    /mobile/i.test(userAgent) ||
    (navigator as any).maxTouchPoints > 1
  );
  
  // OS detection
  const isIOS = isBrowser && /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = isBrowser && /Android/.test(userAgent);
  const isMacOS = platformLower.includes('mac') || userAgentLower.includes('mac');
  const isWindows = platformLower.includes('win') || userAgentLower.includes('win');
  const isLinux = platformLower.includes('linux') || userAgentLower.includes('linux');
  
  const isDesktop = !isMobile && (isMacOS || isWindows || isLinux);
  const isWeb = isBrowser;
  
  return {
    isWeb,
    isMobile,
    isDesktop,
    isIOS,
    isAndroid,
    isMacOS,
    isWindows,
    isLinux,
    isNode: !!isNode,
    isBrowser,
    userAgent,
    platform
  };
}

/**
 * Gets browser information
 * @returns Browser information object
 */
export function getBrowserInfo(): BrowserInfo {
  const defaultInfo: BrowserInfo = {
    name: 'unknown',
    version: '0',
    isChrome: false,
    isFirefox: false,
    isSafari: false,
    isEdge: false,
    isOpera: false,
    isIE: false
  };
  
  if (typeof window === 'undefined' || !navigator) {
    return defaultInfo;
  }
  
  const userAgent = navigator.userAgent;
  let name = 'unknown';
  let version = '0';
  
  // Chrome
  if (/Chrome/.test(userAgent) && !/Chromium/.test(userAgent)) {
    name = 'chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : '0';
  }
  // Firefox
  else if (/Firefox/.test(userAgent)) {
    name = 'firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : '0';
  }
  // Safari
  else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    name = 'safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : '0';
  }
  // Edge
  else if (/Edg/.test(userAgent)) {
    name = 'edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    version = match ? match[1] : '0';
  }
  // Opera
  else if (/OPR/.test(userAgent)) {
    name = 'opera';
    const match = userAgent.match(/OPR\/(\d+)/);
    version = match ? match[1] : '0';
  }
  // Internet Explorer
  else if (/Trident/.test(userAgent)) {
    name = 'ie';
    const match = userAgent.match(/rv:(\d+)/);
    version = match ? match[1] : '0';
  }
  
  return {
    name,
    version,
    isChrome: name === 'chrome',
    isFirefox: name === 'firefox',
    isSafari: name === 'safari',
    isEdge: name === 'edge',
    isOpera: name === 'opera',
    isIE: name === 'ie'
  };
}

/**
 * Gets device information
 * @returns Device information object
 */
export function getDeviceInfo(): DeviceInfo {
  const defaultInfo: DeviceInfo = {
    type: 'desktop',
    isTouchDevice: false,
    screenWidth: 0,
    screenHeight: 0,
    pixelRatio: 1,
    isRetina: false
  };
  
  if (typeof window === 'undefined') {
    return defaultInfo;
  }
  
  const screenWidth = window.screen?.width || window.innerWidth || 0;
  const screenHeight = window.screen?.height || window.innerHeight || 0;
  const pixelRatio = window.devicePixelRatio || 1;
  const isRetina = pixelRatio > 1;
  
  // Touch device detection
  const isTouchDevice = 'ontouchstart' in window || 
                       navigator.maxTouchPoints > 0 || 
                       (navigator as any).msMaxTouchPoints > 0;
  
  // Device type detection
  let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  
  if (screenWidth <= 768) {
    type = 'mobile';
  } else if (screenWidth <= 1024 && isTouchDevice) {
    type = 'tablet';
  }
  
  return {
    type,
    isTouchDevice,
    screenWidth,
    screenHeight,
    pixelRatio,
    isRetina
  };
}

/**
 * Checks if the current environment supports a specific feature
 * @param feature - Feature to check
 * @returns True if feature is supported
 */
export function supportsFeature(feature: string): boolean {
  if (typeof window === 'undefined') return false;
  
  switch (feature) {
    case 'localStorage':
      try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    
    case 'sessionStorage':
      try {
        const test = '__test__';
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    
    case 'indexedDB':
      return 'indexedDB' in window;
    
    case 'webGL':
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    
    case 'geolocation':
      return 'geolocation' in navigator;
    
    case 'pushNotifications':
      return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    
    case 'serviceWorker':
      return 'serviceWorker' in navigator;
    
    case 'webAssembly':
      return 'WebAssembly' in window;
    
    case 'webRTC':
      return 'RTCPeerConnection' in window;
    
    case 'webAudio':
      return 'AudioContext' in window || 'webkitAudioContext' in window;
    
    case 'fullscreen':
      return 'requestFullscreen' in document.documentElement ||
             'webkitRequestFullscreen' in document.documentElement ||
             'mozRequestFullScreen' in document.documentElement ||
             'msRequestFullscreen' in document.documentElement;
    
    case 'pointer':
      return 'PointerEvent' in window;
    
    case 'touch':
      return 'ontouchstart' in window;
    
    case 'vibration':
      return 'vibrate' in navigator;
    
    case 'clipboard':
      return 'clipboard' in navigator;
    
    case 'share':
      return 'share' in navigator;
    
    default:
      return false;
  }
}

/**
 * Gets the preferred color scheme
 * @returns 'light', 'dark', or 'no-preference'
 */
export function getColorScheme(): 'light' | 'dark' | 'no-preference' {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'no-preference';
  }
  
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  
  return 'no-preference';
}

/**
 * Gets the preferred reduced motion setting
 * @returns True if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Checks if the device is online
 * @returns True if online
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Gets the device orientation
 * @returns 'portrait' or 'landscape'
 */
export function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'landscape';
  
  const { innerWidth, innerHeight } = window;
  return innerHeight > innerWidth ? 'portrait' : 'landscape';
}

/**
 * Gets the connection information
 * @returns Connection information object
 */
export function getConnectionInfo(): {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
} {
  if (typeof navigator === 'undefined') return {};
  
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  if (!connection) return {};
  
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData
  };
}

/**
 * Checks if the app is running in standalone mode (PWA)
 * @returns True if in standalone mode
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

/**
 * Gets the safe area insets (for devices with notches)
 * @returns Safe area insets object
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === 'undefined' || !getComputedStyle) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0', 10),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0', 10),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0', 10)
  };
}

/**
 * Checks if the current environment is a development environment
 * @returns True if in development
 */
export function isDevelopment(): boolean {
  if (typeof process !== 'undefined') {
    return process.env.NODE_ENV === 'development';
  }
  
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('local');
  }
  
  return false;
}

/**
 * Gets the current viewport size
 * @returns Viewport dimensions
 */
export function getViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  
  return {
    width: window.innerWidth || document.documentElement.clientWidth || 0,
    height: window.innerHeight || document.documentElement.clientHeight || 0
  };
}

/**
 * Checks if the current platform supports hover
 * @returns True if hover is supported
 */
export function supportsHover(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  
  return window.matchMedia('(hover: hover)').matches;
}

/**
 * Gets the device memory information (if available)
 * @returns Device memory in GB or undefined
 */
export function getDeviceMemory(): number | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as any).deviceMemory;
}

/**
 * Gets the hardware concurrency (number of CPU cores)
 * @returns Number of CPU cores or undefined
 */
export function getHardwareConcurrency(): number | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return navigator.hardwareConcurrency;
}

/**
 * Cross-platform storage interface
 */
export interface PlatformStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * Gets platform-appropriate storage
 * @param type - Storage type preference
 * @returns Storage interface
 */
export function getStorage(type: 'local' | 'session' = 'local'): PlatformStorage {
  // Try browser storage first
  if (typeof window !== 'undefined') {
    const storage = type === 'session' ? sessionStorage : localStorage;
    if (supportsFeature(type === 'session' ? 'sessionStorage' : 'localStorage')) {
      return storage;
    }
  }
  
  // Fallback to in-memory storage
  const memoryStorage = new Map<string, string>();
  
  return {
    getItem: (key: string) => memoryStorage.get(key) || null,
    setItem: (key: string, value: string) => memoryStorage.set(key, value),
    removeItem: (key: string) => memoryStorage.delete(key),
    clear: () => memoryStorage.clear()
  };
}

// Export platform info as a constant for easy access
export const PLATFORM = getPlatformInfo();
export const BROWSER = getBrowserInfo();
export const DEVICE = getDeviceInfo();