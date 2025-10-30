// Modal dialog component

/**
 * Show a modal dialog
 * @param {Object} options - Modal options
 * @param {string} options.title - Modal title
 * @param {string} options.message - Modal message
 * @param {Array<Object>} options.buttons - Array of button objects
 * @returns {Promise} Resolves with button action
 */
function showModal({ title, message, buttons }) {
  return new Promise((resolve) => {
    const modalContainer = document.getElementById('modal-container');

    if (!modalContainer) {
      console.error('Modal container not found');
      resolve(null);
      return;
    }

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    // Create modal content
    const content = document.createElement('div');
    content.className = 'modal-content';

    // Create title
    const titleElement = document.createElement('div');
    titleElement.className = 'modal-title';
    titleElement.textContent = title;

    // Create message
    const messageElement = document.createElement('div');
    messageElement.className = 'modal-message';
    messageElement.textContent = message;

    // Create actions container
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'modal-actions';

    // Create buttons
    buttons.forEach(buttonConfig => {
      const button = document.createElement('button');
      button.className = `btn ${buttonConfig.variant || 'btn-secondary'}`;
      button.textContent = buttonConfig.text;

      button.onclick = () => {
        closeModal();
        resolve(buttonConfig.action);
      };

      actionsContainer.appendChild(button);
    });

    // Assemble modal
    content.appendChild(titleElement);
    content.appendChild(messageElement);
    content.appendChild(actionsContainer);
    overlay.appendChild(content);
    modalContainer.appendChild(overlay);

    // Close modal function
    function closeModal() {
      if (modalContainer.contains(overlay)) {
        modalContainer.removeChild(overlay);
      }
    }

    // Close on overlay click
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        closeModal();
        resolve(null);
      }
    };
  });
}

/**
 * Show confirm dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @returns {Promise<boolean>} True if confirmed
 */
function showConfirmDialog(title, message) {
  return showModal({
    title: title,
    message: message,
    buttons: [
      {
        text: 'Cancel',
        variant: 'btn-secondary',
        action: false
      },
      {
        text: 'Confirm',
        variant: 'btn-primary',
        action: true
      }
    ]
  });
}

/**
 * Show delete confirmation dialog
 * @param {string} itemName - Name of item to delete
 * @returns {Promise<boolean>} True if confirmed
 */
function showDeleteConfirmDialog(itemName) {
  return showModal({
    title: 'Delete Route?',
    message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    buttons: [
      {
        text: 'Cancel',
        variant: 'btn-secondary',
        action: false
      },
      {
        text: 'Delete',
        variant: 'btn-danger',
        action: true
      }
    ]
  });
}

/**
 * Show alert dialog (single OK button)
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 */
function showAlertDialog(title, message) {
  return showModal({
    title: title,
    message: message,
    buttons: [
      {
        text: 'OK',
        variant: 'btn-primary',
        action: true
      }
    ]
  });
}

/**
 * Close all modals
 */
function closeAllModals() {
  const modalContainer = document.getElementById('modal-container');

  if (modalContainer) {
    modalContainer.innerHTML = '';
  }
}
