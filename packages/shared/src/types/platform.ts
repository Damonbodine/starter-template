/**
 * Platform-specific types for handling differences between web and mobile platforms
 */

import { PlatformType, DeviceType, PlatformInfo } from './common';

/**
 * Navigation types for different platforms
 */
export type NavigationType = 
  | 'stack'     // Stack navigation (mobile)
  | 'tab'       // Tab navigation (mobile)
  | 'drawer'    // Drawer navigation (mobile)
  | 'modal'     // Modal navigation
  | 'browser';  // Browser navigation (web)

/**
 * Platform-specific navigation configuration
 */
export interface NavigationConfig {
  /** Navigation type */
  type: NavigationType;
  /** Platform-specific options */
  options: {
    web?: {
      /** Browser history mode */
      historyMode: 'browser' | 'hash';
      /** Base URL */
      base?: string;
      /** Scroll behavior */
      scrollBehavior?: 'auto' | 'smooth';
    };
    mobile?: {
      /** Screen transition animations */
      animations: boolean;
      /** Gesture handling */
      gestures: boolean;
      /** Status bar style */
      statusBar?: 'light' | 'dark' | 'auto';
      /** Navigation bar style */
      navigationBar?: {
        backgroundColor?: string;
        titleColor?: string;
        buttonColor?: string;
      };
    };
  };
}

/**
 * Platform-specific storage types
 */
export type StorageType = 
  | 'localStorage'    // Web localStorage
  | 'sessionStorage'  // Web sessionStorage
  | 'asyncStorage'    // React Native AsyncStorage
  | 'secureStorage'   // Platform secure storage
  | 'mmkv'           // MMKV fast storage
  | 'sqlite';        // SQLite database

/**
 * Storage configuration
 */
export interface StorageConfig {
  /** Storage type */
  type: StorageType;
  /** Storage options */
  options?: {
    /** Encryption enabled */
    encrypted?: boolean;
    /** Storage size limit */
    sizeLimit?: number;
    /** TTL for items (seconds) */
    ttl?: number;
    /** Compression enabled */
    compressed?: boolean;
  };
}

/**
 * Platform-specific permission types
 */
export type PermissionType = 
  | 'camera'
  | 'microphone'
  | 'location'
  | 'notifications'
  | 'contacts'
  | 'calendar'
  | 'photos'
  | 'files'
  | 'bluetooth'
  | 'biometrics';

/**
 * Permission status
 */
export type PermissionStatus = 
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'restricted'
  | 'limited';

/**
 * Permission request result
 */
export interface PermissionResult {
  /** Permission type */
  type: PermissionType;
  /** Permission status */
  status: PermissionStatus;
  /** Platform-specific details */
  details?: {
    /** Can request permission */
    canAskAgain?: boolean;
    /** Explanation required */
    shouldShowRationale?: boolean;
    /** Error message */
    error?: string;
  };
}

/**
 * Platform capabilities
 */
export interface PlatformCapabilities {
  /** Platform information */
  platform: PlatformInfo;
  /** Available features */
  features: {
    /** Camera available */
    camera: boolean;
    /** Microphone available */
    microphone: boolean;
    /** GPS/location available */
    location: boolean;
    /** Push notifications supported */
    pushNotifications: boolean;
    /** Biometric authentication */
    biometrics: boolean;
    /** File system access */
    fileSystem: boolean;
    /** Bluetooth support */
    bluetooth: boolean;
    /** NFC support */
    nfc: boolean;
    /** Accelerometer/gyroscope */
    sensors: boolean;
    /** Offline support */
    offline: boolean;
    /** Background processing */
    backgroundProcessing: boolean;
    /** Deep linking */
    deepLinking: boolean;
    /** Share API */
    sharing: boolean;
    /** Clipboard access */
    clipboard: boolean;
  };
  /** Storage capabilities */
  storage: {
    /** Available storage types */
    types: StorageType[];
    /** Maximum storage size */
    maxSize?: number;
    /** Persistent storage */
    persistent: boolean;
  };
  /** Network capabilities */
  network: {
    /** Online/offline detection */
    connectionDetection: boolean;
    /** Network type detection */
    networkType: boolean;
    /** Background sync */
    backgroundSync: boolean;
  };
}

/**
 * Platform-specific UI components
 */
export interface PlatformUIComponents {
  /** Button component props */
  Button: {
    web?: {
      /** CSS classes */
      className?: string;
      /** HTML button type */
      type?: 'button' | 'submit' | 'reset';
    };
    mobile?: {
      /** Touch feedback */
      hapticFeedback?: boolean;
      /** Ripple effect */
      ripple?: boolean;
      /** Icon position */
      iconPosition?: 'left' | 'right' | 'top' | 'bottom';
    };
  };
  
  /** Input component props */
  Input: {
    web?: {
      /** HTML input type */
      type?: string;
      /** Auto-complete */
      autoComplete?: string;
    };
    mobile?: {
      /** Keyboard type */
      keyboardType?: 'default' | 'numeric' | 'email' | 'phone' | 'url';
      /** Return key type */
      returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
      /** Auto-focus */
      autoFocus?: boolean;
    };
  };
  
  /** Modal component props */
  Modal: {
    web?: {
      /** Modal backdrop */
      backdrop?: boolean;
      /** ESC key to close */
      keyboard?: boolean;
    };
    mobile?: {
      /** Presentation style */
      presentationStyle?: 'modal' | 'formSheet' | 'pageSheet';
      /** Animation type */
      animationType?: 'slide' | 'fade' | 'none';
    };
  };
}

/**
 * Platform-specific styling
 */
export interface PlatformStyling {
  /** Web-specific styles */
  web?: {
    /** CSS styles */
    css?: Record<string, any>;
    /** CSS classes */
    className?: string;
    /** Media queries */
    mediaQueries?: Record<string, Record<string, any>>;
  };
  /** Mobile-specific styles */
  mobile?: {
    /** React Native styles */
    style?: Record<string, any>;
    /** Platform-specific styles */
    ios?: Record<string, any>;
    android?: Record<string, any>;
  };
}

/**
 * Platform-specific configuration
 */
export interface PlatformConfig {
  /** Current platform */
  platform: PlatformType;
  /** Platform capabilities */
  capabilities: PlatformCapabilities;
  /** Navigation configuration */
  navigation: NavigationConfig;
  /** Storage configuration */
  storage: StorageConfig;
  /** UI component configurations */
  ui: PlatformUIComponents;
  /** Default styling */
  styling: PlatformStyling;
  /** Feature flags */
  features: Record<string, boolean>;
}

/**
 * Platform-specific hooks return type
 */
export interface PlatformHooks {
  /** Platform information */
  usePlatform: () => PlatformInfo;
  /** Device capabilities */
  useCapabilities: () => PlatformCapabilities;
  /** Permission management */
  usePermissions: () => {
    request: (type: PermissionType) => Promise<PermissionResult>;
    check: (type: PermissionType) => Promise<PermissionStatus>;
    openSettings: () => void;
  };
  /** Network status */
  useNetworkStatus: () => {
    isOnline: boolean;
    networkType?: string;
    isInternetReachable?: boolean;
  };
  /** Device orientation */
  useOrientation: () => {
    orientation: 'portrait' | 'landscape';
    isPortrait: boolean;
    isLandscape: boolean;
  };
  /** Safe area insets (mobile) */
  useSafeArea: () => {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  /** App state (mobile) */
  useAppState: () => {
    appState: 'active' | 'background' | 'inactive';
    isActive: boolean;
    isBackground: boolean;
  };
}

/**
 * Cross-platform component props
 */
export interface CrossPlatformComponentProps {
  /** Platform-specific styles */
  style?: PlatformStyling;
  /** Platform-specific behavior */
  behavior?: {
    web?: Record<string, any>;
    mobile?: Record<string, any>;
    ios?: Record<string, any>;
    android?: Record<string, any>;
  };
  /** Platform visibility */
  platforms?: PlatformType[];
  /** Test ID for e2e testing */
  testID?: string;
  /** Accessibility props */
  accessibility?: {
    label?: string;
    hint?: string;
    role?: string;
    state?: Record<string, boolean>;
  };
}

/**
 * Platform-specific API endpoints
 */
export interface PlatformApiEndpoints {
  /** Web-specific endpoints */
  web?: {
    /** Progressive Web App manifest */
    manifest: '/manifest.json';
    /** Service worker */
    serviceWorker: '/sw.js';
    /** Web push subscription */
    webPush: '/api/web-push/subscribe';
  };
  /** Mobile-specific endpoints */
  mobile?: {
    /** App update check */
    updateCheck: '/api/mobile/update-check';
    /** Push notification registration */
    pushRegister: '/api/mobile/push/register';
    /** Deep link validation */
    deepLinkValidate: '/api/mobile/deep-link/validate';
  };
}

/**
 * Platform-specific error handling
 */
export interface PlatformErrorHandling {
  /** Error reporting */
  reporting: {
    /** Crash analytics */
    crashlytics?: boolean;
    /** Error tracking service */
    errorTracking?: boolean;
    /** Performance monitoring */
    performance?: boolean;
  };
  /** Error boundaries */
  boundaries: {
    /** Global error boundary */
    global: boolean;
    /** Screen-level error boundaries */
    screen: boolean;
    /** Component-level error boundaries */
    component: boolean;
  };
  /** Error recovery */
  recovery: {
    /** Auto-retry failed requests */
    autoRetry: boolean;
    /** Offline queue */
    offlineQueue: boolean;
    /** Fallback UI */
    fallbackUI: boolean;
  };
}

/**
 * Development tools configuration
 */
export interface PlatformDevTools {
  /** Development mode */
  isDev: boolean;
  /** Debug tools */
  debug: {
    /** Redux DevTools (web) */
    reduxDevTools?: boolean;
    /** React DevTools */
    reactDevTools?: boolean;
    /** Flipper (mobile) */
    flipper?: boolean;
    /** Console logs */
    console: boolean;
  };
  /** Hot reload */
  hotReload: boolean;
  /** Fast refresh */
  fastRefresh: boolean;
}