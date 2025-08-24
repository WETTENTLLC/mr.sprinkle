// Minimal Ambassador Integration for Existing Forms
(function() {
    // Capture ambassador code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const ambassadorCode = urlParams.get('ref') || localStorage.getItem('ambassadorCode');
    
    if (ambassadorCode) {
        localStorage.setItem('ambassadorCode', ambassadorCode);
        
        // Track visit
        fetch('/api/track-visit.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ambassador_code: ambassadorCode,
                page: window.location.pathname
            })
        }).catch(() => {});
        
        // Show discount banner
        const banner = document.createElement('div');
        banner.innerHTML = '🎉 Special 5% Discount Applied! Referred by: ' + ambassadorCode;
        banner.style.cssText = 'background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; padding: 15px; text-align: center; font-weight: bold; position: fixed; top: 0; left: 0; right: 0; z-index: 1000;';
        document.body.insertBefore(banner, document.body.firstChild);
        document.body.style.paddingTop = '60px';
    }
    
    // Add ambassador code to all forms
    document.addEventListener('DOMContentLoaded', function() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (ambassadorCode) {
                const hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = 'ambassador_code';
                hiddenField.value = ambassadorCode;
                form.appendChild(hiddenField);
            }
        });
    });
})();