// Toast notification component

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type: 'success', 'error', 'info' (default: 'info')
 * @param {number} duration - Duration in ms (default: 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');

  if (!container) {
    console.error('Toast container not found');
    return;
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  // Add to container
  container.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';

    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, duration);
}

/**
 * Show success toast
 * @param {string} message - Success message
 */
function showSuccessToast(message) {
  showToast(message, 'success');
}

/**
 * Show error toast
 * @param {string} message - Error message
 */
function showErrorToast(message) {
  showToast(message, 'error', 4000);
}

/**
 * Show info toast
 * @param {string} message - Info message
 */
function showInfoToast(message) {
  showToast(message, 'info');
}

/**
 * Clear all toasts
 */
function clearAllToasts() {
  const container = document.getElementById('toast-container');

  if (container) {
    container.innerHTML = '';
  }
}
