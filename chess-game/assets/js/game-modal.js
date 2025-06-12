/**
 * PAWNED Game Modal Utility
 * Provides consistent modal functionality across the entire game
 * Matches the game's visual style and theme
 */

class GameModal {
    constructor(containerId = 'gameModalContainer') {
        this.containerId = containerId;
        this.createModalContainer();
        this.setupEventListeners();
    }

    createModalContainer() {
        // Remove existing modal if it exists
        const existing = document.getElementById(this.containerId);
        if (existing) {
            existing.remove();
        }

        const modalHTML = `
            <div id="${this.containerId}" class="game-modal">
                <div class="game-modal-content">
                    <div class="game-modal-header">
                        <div id="gameModalIcon" class="game-modal-icon"></div>
                        <h2 id="gameModalTitle" class="game-modal-title"></h2>
                    </div>
                    <p id="gameModalMessage" class="game-modal-message"></p>
                    <div id="gameModalButtons" class="game-modal-buttons">
                        <!-- Buttons will be added dynamically -->
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById(this.containerId);
        this.modalContent = this.modal.querySelector('.game-modal-content');
        this.modalTitle = document.getElementById('gameModalTitle');
        this.modalMessage = document.getElementById('gameModalMessage');
        this.modalIcon = document.getElementById('gameModalIcon');
        this.buttonsContainer = document.getElementById('gameModalButtons');
    }

    setupEventListeners() {
        // Keyboard listener for Escape key
        this.escapeHandler = (e) => {
            if (e.key === 'Escape' && this.isVisible && this.canCloseOnEscape) {
                this.hide();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }

    show(options = {}) {
        const {
            title = '',
            message = '',
            type = 'info', // 'success', 'error', 'warning', 'info', 'confirmation'
            buttons = [{ text: 'Aceptar', primary: true }],
            closeOnBackdrop = true,
            closeOnEscape = true
        } = options;

        this.canCloseOnEscape = closeOnEscape;
        
        // Set content
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        
        // Set icon and styling based on type
        this.setModalType(type);
        
        // Clear and create buttons
        this.createButtons(buttons);
        
        // Set up backdrop click behavior
        this.modal.onclick = closeOnBackdrop ? (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        } : null;
        
        // Show modal
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.isVisible = true;

        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    setModalType(type) {
        // Reset classes
        this.modalContent.className = 'game-modal-content';
        
        switch (type) {
            case 'success':
                this.modalIcon.textContent = '✅';
                this.modalIcon.className = 'game-modal-icon success';
                this.modalTitle.style.color = '#4caf50';
                break;
            case 'error':
                this.modalIcon.textContent = '❌';
                this.modalIcon.className = 'game-modal-icon error';
                this.modalTitle.style.color = '#f44336';
                break;
            case 'warning':
                this.modalIcon.textContent = '⚠️';
                this.modalIcon.className = 'game-modal-icon warning';
                this.modalTitle.style.color = '#ff9800';
                break;
            case 'confirmation':
                this.modalIcon.textContent = '❓';
                this.modalIcon.className = 'game-modal-icon confirmation';
                this.modalTitle.style.color = '#ffd54f';
                this.modalContent.classList.add('confirmation');
                break;
            default: // info
                this.modalIcon.textContent = 'ℹ️';
                this.modalIcon.className = 'game-modal-icon info';
                this.modalTitle.style.color = '#2196f3';
                break;
        }
    }

    createButtons(buttons) {
        this.buttonsContainer.innerHTML = '';
        
        buttons.forEach((button, index) => {
            const btn = document.createElement('button');
            btn.className = `game-modal-btn ${button.primary ? 'primary' : 'secondary'}`;
            btn.textContent = button.text;
            
            btn.onclick = () => {
                this.hide();
                if (this.resolvePromise) {
                    this.resolvePromise(button.value !== undefined ? button.value : index);
                }
                if (button.onClick) {
                    button.onClick();
                }
            };
            
            this.buttonsContainer.appendChild(btn);
        });
    }

    hide() {
        if (!this.isVisible) return;
        
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
        this.isVisible = false;
        
        if (this.resolvePromise) {
            this.resolvePromise(null);
            this.resolvePromise = null;
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.escapeHandler);
        if (this.modal) {
            this.modal.remove();
        }
    }

    // Convenience methods
    static success(title, message, buttonText = 'Aceptar') {
        const modal = new GameModal();
        return modal.show({
            title,
            message,
            type: 'success',
            buttons: [{ text: buttonText, primary: true }]
        });
    }

    static error(title, message, buttonText = 'Aceptar') {
        const modal = new GameModal();
        return modal.show({
            title,
            message,
            type: 'error',
            buttons: [{ text: buttonText, primary: true }]
        });
    }

    static warning(title, message, buttonText = 'Aceptar') {
        const modal = new GameModal();
        return modal.show({
            title,
            message,
            type: 'warning',
            buttons: [{ text: buttonText, primary: true }]
        });
    }

    static info(title, message, buttonText = 'Aceptar') {
        const modal = new GameModal();
        return modal.show({
            title,
            message,
            type: 'info',
            buttons: [{ text: buttonText, primary: true }]
        });
    }

    static confirm(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') {
        const modal = new GameModal();
        return modal.show({
            title,
            message,
            type: 'confirmation',
            buttons: [
                { text: cancelText, value: false },
                { text: confirmText, primary: true, value: true }
            ],
            closeOnBackdrop: false,
            closeOnEscape: false
        });
    }
}

// Make it globally available
if (typeof window !== 'undefined') {
    window.GameModal = GameModal;
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameModal;
}
