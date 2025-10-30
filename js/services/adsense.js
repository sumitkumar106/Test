// Google AdSense service for web ads

/**
 * Initialize AdSense (called on app load)
 */
function initializeAdSense() {
  try {
    const client = CONFIG.adsense.client;

    if (!client || client === 'ca-pub-YOUR_PUBLISHER_ID') {
      console.warn('AdSense not configured. Ads will not be displayed.');
      return false;
    }

    console.log('AdSense initialized with client:', client);
    return true;
  } catch (error) {
    console.error('AdSense initialization error:', error);
    return false;
  }
}

/**
 * Create and insert a banner ad
 * @param {string} containerId - ID of container element to insert ad into
 * @param {string} slotId - Ad slot ID (optional, uses config default)
 * @returns {HTMLElement|null} Created ad element
 */
function createBannerAd(containerId, slotId = null) {
  try {
    const container = document.getElementById(containerId);

    if (!container) {
      console.error('Ad container not found:', containerId);
      return null;
    }

    const client = CONFIG.adsense.client;
    const slot = slotId || CONFIG.adsense.slotBanner;

    if (!client || client === 'ca-pub-YOUR_PUBLISHER_ID') {
      // Show placeholder if AdSense not configured
      container.innerHTML = '<div class="ad-banner-placeholder">Advertisement Space</div>';
      return null;
    }

    // Create AdSense ins element
    const adElement = document.createElement('ins');
    adElement.className = 'adsbygoogle';
    adElement.style.display = 'block';
    adElement.setAttribute('data-ad-client', client);
    adElement.setAttribute('data-ad-slot', slot);
    adElement.setAttribute('data-ad-format', 'auto');
    adElement.setAttribute('data-full-width-responsive', 'true');

    // Clear container and append ad
    container.innerHTML = '';
    container.appendChild(adElement);

    // Push ad
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (pushError) {
      console.error('AdSense push error:', pushError);
    }

    console.log('Banner ad created in:', containerId);
    return adElement;

  } catch (error) {
    console.error('Error creating banner ad:', error);
    return null;
  }
}

/**
 * Show an interstitial ad (after route save)
 * For web, we'll simulate with a brief overlay ad
 */
function showInterstitialAd() {
  try {
    const client = CONFIG.adsense.client;
    const slot = CONFIG.adsense.slotInterstitial;

    if (!client || client === 'ca-pub-YOUR_PUBLISHER_ID') {
      console.log('Interstitial ad skipped (not configured)');
      return;
    }

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'interstitial-ad-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    `;

    // Create ad container
    const adContainer = document.createElement('div');
    adContainer.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 90%;
      max-height: 90%;
      overflow: auto;
      position: relative;
    `;

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.className = 'btn btn-secondary';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 8px 16px;
      min-width: 80px;
    `;

    closeButton.onclick = () => {
      document.body.removeChild(overlay);
    };

    // Create ad element
    const adElement = document.createElement('ins');
    adElement.className = 'adsbygoogle';
    adElement.style.display = 'block';
    adElement.setAttribute('data-ad-client', client);
    adElement.setAttribute('data-ad-slot', slot);
    adElement.setAttribute('data-ad-format', 'auto');

    // Assemble
    adContainer.appendChild(closeButton);
    adContainer.appendChild(adElement);
    overlay.appendChild(adContainer);
    document.body.appendChild(overlay);

    // Push ad
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (pushError) {
      console.error('AdSense push error:', pushError);
    }

    // Auto-close after 5 seconds
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 5000);

    console.log('Interstitial ad shown');

  } catch (error) {
    console.error('Error showing interstitial ad:', error);
  }
}

/**
 * Remove all ads from page
 */
function removeAllAds() {
  try {
    document.querySelectorAll('.adsbygoogle').forEach(ad => {
      if (ad.parentElement) {
        ad.parentElement.removeChild(ad);
      }
    });

    const overlay = document.getElementById('interstitial-ad-overlay');
    if (overlay && document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }

    console.log('All ads removed');
  } catch (error) {
    console.error('Error removing ads:', error);
  }
}

/**
 * Refresh banner ads (reload ads on page)
 */
function refreshBannerAds() {
  try {
    // AdSense doesn't support programmatic refresh by default
    // This would require recreating the ad elements
    console.log('Ad refresh requested (not implemented for AdSense)');
  } catch (error) {
    console.error('Error refreshing ads:', error);
  }
}

/**
 * Check if AdSense is blocked by ad blocker
 * @returns {Promise<boolean>} True if blocked
 */
async function isAdBlockerActive() {
  try {
    // Simple check: see if adsbygoogle array exists
    await sleep(1000);

    if (typeof window.adsbygoogle === 'undefined') {
      console.warn('Ad blocker may be active');
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Show message when ad blocker detected
 */
function showAdBlockerMessage() {
  const message = `
    <div style="text-align: center; padding: 15px; background: #fff3cd; color: #856404; border-radius: 4px; margin: 10px;">
      <strong>Ad Blocker Detected</strong><br>
      <small>Please consider disabling your ad blocker to support this free service.</small>
    </div>
  `;

  const container = document.getElementById('ad-banner-container');
  if (container) {
    container.innerHTML = message;
  }
}

/**
 * Initialize ads on all ad containers on page
 */
function initializePageAds() {
  // Create banner ad in main container
  createBannerAd('ad-banner-container');

  // Check for ad blocker
  isAdBlockerActive().then(blocked => {
    if (blocked) {
      showAdBlockerMessage();
    }
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdSense);
} else {
  initializeAdSense();
}
