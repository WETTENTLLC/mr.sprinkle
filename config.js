/**
 * Ambassador System Configuration
 * Update BACKEND_URL when you set up your PHP hosting
 */

const CONFIG = {
    // Update this to your PHP backend URL after you get hosting
    // Example: https://your-domain.com/ambassador-backend.php
    // or https://your-subdomain.example.com/ambassador-backend.php
    BACKEND_URL: 'https://mrsprinklereno.com/ambassador-backend.php',
    
    PORTAL_URL: 'https://mrsprinklereno.com/ambassador-portal.html',
    AMBASSADOR_CODE: 'NATALIA09',
    ADMIN_EMAIL: 'mrsprinklereno@gmail.com'
};

// Export for use in scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
