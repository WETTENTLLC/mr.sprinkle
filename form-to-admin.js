// Integration script to connect mold form submissions to admin dashboard
// This script captures form submissions and adds them to pending leads

function addToAdminDashboard(formData) {
    // Get existing pending leads from localStorage
    let pendingLeads = JSON.parse(localStorage.getItem('pendingLeads') || '[]');
    
    // Create new lead entry
    const newLead = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        customer: formData.get('customerName') || formData.get('customer_name'),
        phone: formData.get('phone') || formData.get('customer_phone'),
        email: formData.get('email') || formData.get('customer_email'),
        ambassadorCode: formData.get('ambassadorCode') || formData.get('ambassador_code'),
        service: formData.get('serviceType') || formData.get('service_type') || formData.get('materialType'),
        notes: formData.get('additionalNotes') || formData.get('additional_notes') || formData.get('design')
    };
    
    // Only add if there's an ambassador code
    if (newLead.ambassadorCode) {
        pendingLeads.push(newLead);
        localStorage.setItem('pendingLeads', JSON.stringify(pendingLeads));
        
        // Send notification email to admin
        const subject = `New Ambassador Referral - ${newLead.ambassadorCode}`;
        const body = `New customer referred by ambassador:\n\nCustomer: ${newLead.customer}\nPhone: ${newLead.phone}\nEmail: ${newLead.email}\nAmbassador Code: ${newLead.ambassadorCode}\nService: ${newLead.service}\nDate: ${newLead.date}\n\nCheck admin dashboard to confirm payment and calculate commission.`;
        
        // Auto-open email (optional)
        const mailtoLink = `mailto:mrsprinklereno@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        // Uncomment next line if you want auto-email notifications
        // window.open(mailtoLink);
        
        console.log('Ambassador referral added to admin dashboard:', newLead);
    }
}

// Function to integrate with existing form submissions
function integrateWithForms() {
    // Integrate with mold form
    const moldForm = document.getElementById('moldForm');
    if (moldForm) {
        moldForm.addEventListener('submit', function(e) {
            const formData = new FormData(this);
            addToAdminDashboard(formData);
        });
    }
    
    // Integrate with booking form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            const formData = new FormData(this);
            addToAdminDashboard(formData);
        });
    }
}

// Initialize integration when page loads
document.addEventListener('DOMContentLoaded', integrateWithForms);