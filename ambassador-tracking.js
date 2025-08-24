// Ambassador Tracking System - Mr. Sprinkle
class AmbassadorTracker {
    constructor() {
        this.ambassadorCode = null;
        this.init();
    }

    init() {
        this.captureAmbassadorCode();
        this.setupFormIntegration();
        this.displayAmbassadorInfo();
    }

    captureAmbassadorCode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.ambassadorCode = urlParams.get('ref') || localStorage.getItem('ambassadorCode');
        
        if (this.ambassadorCode) {
            localStorage.setItem('ambassadorCode', this.ambassadorCode);
            this.trackVisit();
        }
    }

    trackVisit() {
        fetch('/api/track-visit.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ambassador_code: this.ambassadorCode,
                page: window.location.pathname,
                timestamp: new Date().toISOString()
            })
        });
    }

    displayAmbassadorInfo() {
        if (this.ambassadorCode) {
            const discountBanner = document.createElement('div');
            discountBanner.className = 'ambassador-discount-banner';
            discountBanner.innerHTML = `
                <div class="discount-content">
                    <span class="discount-text">🎉 Special 10% Discount Applied!</span>
                    <span class="ambassador-info">Referred by Ambassador: ${this.ambassadorCode}</span>
                </div>
            `;
            document.body.insertBefore(discountBanner, document.body.firstChild);
        }
    }

    setupFormIntegration() {
        document.addEventListener('DOMContentLoaded', () => {
            const forms = document.querySelectorAll('form[data-ambassador-form]');
            forms.forEach(form => {
                if (this.ambassadorCode) {
                    const hiddenField = document.createElement('input');
                    hiddenField.type = 'hidden';
                    hiddenField.name = 'ambassador_code';
                    hiddenField.value = this.ambassadorCode;
                    form.appendChild(hiddenField);
                }
                
                form.addEventListener('submit', (e) => this.handleFormSubmit(e, form));
            });
        });
    }

    handleFormSubmit(e, form) {
        e.preventDefault();
        const formData = new FormData(form);
        
        fetch('/api/process-booking.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showSuccessMessage();
                form.reset();
            } else {
                this.showErrorMessage(data.message);
            }
        })
        .catch(error => {
            this.showErrorMessage('Booking failed. Please try again.');
        });
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = '✅ Booking confirmed! We\'ll contact you within 24 hours.';
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }

    showErrorMessage(text) {
        const message = document.createElement('div');
        message.className = 'error-message';
        message.innerHTML = `❌ ${text}`;
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }
}

// Initialize tracking
new AmbassadorTracker();

// CSS Styles
const styles = `
.ambassador-discount-banner {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #000;
    padding: 15px;
    text-align: center;
    font-weight: bold;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.discount-content {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
}

.discount-text {
    font-size: 18px;
}

.ambassador-info {
    font-size: 14px;
    opacity: 0.8;
}

.success-message, .error-message {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 2000;
}

.success-message {
    background: #4CAF50;
    color: white;
}

.error-message {
    background: #f44336;
    color: white;
}

@media (max-width: 768px) {
    .discount-content {
        flex-direction: column;
        gap: 5px;
    }
    .discount-text {
        font-size: 16px;
    }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);