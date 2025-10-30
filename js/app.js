// Main Application - Initialize and start the app

/**
 * Initialize the application
 */
function initializeApp() {
  console.log('Initializing Bus Stand Manager...');

  // Check browser compatibility
  if (!checkBrowserCompatibility()) {
    showErrorMessage('Your browser is not compatible with this application. Please use a modern browser.');
    return;
  }

  // Initialize device ID for guest mode
  const deviceId = getOrCreateDeviceId();
  console.log('Device ID:', deviceId);

  // Initialize AdSense
  initializeAdSense();

  // Initialize router
  initializeRouter();

  // Test API connections (optional, non-blocking)
  testConnections();

  // Setup global error handler
  setupGlobalErrorHandler();

  // Setup service worker (if available, for offline support)
  setupServiceWorker();

  console.log('Bus Stand Manager initialized successfully');
}

/**
 * Check browser compatibility
 * @returns {boolean} True if compatible
 */
function checkBrowserCompatibility() {
  try {
    // Check for required features
    const hasLocalStorage = isLocalStorageAvailable();
    const hasFetch = typeof fetch === 'function';
    const hasPromise = typeof Promise !== 'undefined';

    if (!hasLocalStorage) {
      console.error('LocalStorage not available');
      return false;
    }

    if (!hasFetch) {
      console.error('Fetch API not available');
      return false;
    }

    if (!hasPromise) {
      console.error('Promise not available');
      return false;
    }

    return true;

  } catch (error) {
    console.error('Browser compatibility check failed:', error);
    return false;
  }
}

/**
 * Test API connections (non-blocking)
 */
async function testConnections() {
  // Test Firestore connection
  checkFirestoreConnection()
    .then(isConnected => {
      if (isConnected) {
        console.log('✓ Firestore connection OK');
      } else {
        console.warn('⚠ Firestore not available, will use localStorage');
      }
    })
    .catch(error => {
      console.warn('Firestore connection test failed:', error);
    });

  // Test Gemini API connection
  testGeminiAPI()
    .then(isWorking => {
      if (isWorking) {
        console.log('✓ Gemini AI API connection OK');
      } else {
        console.warn('⚠ Gemini AI API not available');
      }
    })
    .catch(error => {
      console.warn('Gemini API test failed:', error);
    });
}

/**
 * Setup global error handler
 */
function setupGlobalErrorHandler() {
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error:', { message, source, lineno, colno, error });

    // Show user-friendly error message
    if (!isDevelopment()) {
      showErrorToast('An unexpected error occurred. Please try again.');
    }

    return false; // Let browser handle error too
  };

  // Handle unhandled promise rejections
  window.onunhandledrejection = function(event) {
    console.error('Unhandled promise rejection:', event.reason);

    if (!isDevelopment()) {
      showErrorToast('An unexpected error occurred. Please try again.');
    }
  };
}

/**
 * Setup service worker for offline support
 */
function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Service worker setup disabled for now
    // Enable this in production with proper service worker file
    /*
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.warn('Service Worker registration failed:', error);
      });
    */
  }
}

/**
 * Show error message overlay
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.9);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    padding: 20px;
    text-align: center;
  `;

  overlay.innerHTML = `
    <div>
      <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Error</div>
      <div style="font-size: 14px;">${message}</div>
    </div>
  `;

  document.body.appendChild(overlay);
}

/**
 * Show welcome message on first visit
 */
function showWelcomeMessage() {
  const hasVisited = localStorage.getItem('has_visited');

  if (!hasVisited) {
    setTimeout(() => {
      showInfoToast('Welcome to Bus Stand Manager! Tap + to create your first route.');
      localStorage.setItem('has_visited', 'true');
    }, 1000);
  }
}

/**
 * Get app version
 * @returns {string} App version
 */
function getAppVersion() {
  return '1.0.0';
}

/**
 * Get app info
 * @returns {Object} App information
 */
function getAppInfo() {
  return {
    name: 'Bus Stand Manager',
    version: getAppVersion(),
    description: 'Manage bus routes and schedules',
    author: 'Your Name',
    buildDate: '2025-01-15'
  };
}

/**
 * Log app info to console
 */
function logAppInfo() {
  const info = getAppInfo();

  console.log(`
╔════════════════════════════════════════╗
║   ${info.name}   ║
║   Version: ${info.version}                    ║
║   ${info.description}  ║
╚════════════════════════════════════════╝
  `);
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    logAppInfo();
    initializeApp();
    showWelcomeMessage();
  });
} else {
  logAppInfo();
  initializeApp();
  showWelcomeMessage();
}

// Export for debugging in console
window.app = {
  version: getAppVersion(),
  info: getAppInfo(),
  navigate: navigateTo,
  refreshRoutes: refreshRoutes,
  clearAllData: () => {
    if (confirm('Clear all data? This cannot be undone.')) {
      clearAllLocalRoutes();
      showSuccessToast('All data cleared');
      navigateTo('routes-list');
    }
  }
};
