// Ad Banner component

/**
 * Create and render ad banner
 * @param {string} containerId - ID of container to render ad in
 */
function renderAdBanner(containerId = 'ad-banner-container') {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error('Ad banner container not found:', containerId);
    return;
  }

  // Use AdSense service to create banner
  createBannerAd(containerId);
}

/**
 * Remove ad banner
 * @param {string} containerId - ID of container
 */
function removeAdBanner(containerId = 'ad-banner-container') {
  const container = document.getElementById(containerId);

  if (container) {
    container.innerHTML = '';
  }
}

/**
 * Show ad banner container (if hidden)
 */
function showAdBannerContainer() {
  const container = document.getElementById('ad-banner-container');

  if (container) {
    container.style.display = 'flex';
  }
}

/**
 * Hide ad banner container
 */
function hideAdBannerContainer() {
  const container = document.getElementById('ad-banner-container');

  if (container) {
    container.style.display = 'none';
  }
}

/**
 * Initialize ad banner on page load
 */
function initializeAdBanner() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderAdBanner();
    });
  } else {
    renderAdBanner();
  }
}

// Auto-initialize
initializeAdBanner();
