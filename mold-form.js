// Mold Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('moldForm');
    const teeth = document.querySelectorAll('.tooth');
    const selectedTeethList = document.getElementById('selectedTeethList');
    const designUpload = document.getElementById('designUpload');
    const uploadPreview = document.getElementById('uploadPreview');
    
    let selectedTeeth = [];

    // Teeth selection functionality
    teeth.forEach(tooth => {
        tooth.addEventListener('click', function() {
            const position = this.dataset.position;
            const name = this.dataset.name;
            
            if (this.classList.contains('selected')) {
                // Deselect
                this.classList.remove('selected');
                selectedTeeth = selectedTeeth.filter(t => t.position !== position);
            } else {
                // Select
                this.classList.add('selected');
                selectedTeeth.push({
                    position: position,
                    name: name
                });
            }
            
            updateSelectedTeethList();
        });
    });

    function updateSelectedTeethList() {
        selectedTeethList.innerHTML = '';
        selectedTeeth.forEach(tooth => {
            const span = document.createElement('span');
            span.className = 'selected-tooth';
            span.textContent = `${tooth.name} (${tooth.position})`;
            selectedTeethList.appendChild(span);
        });
    }

    // File upload preview
    designUpload.addEventListener('change', function(e) {
        uploadPreview.innerHTML = '';
        
        Array.from(e.target.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = 'Uploaded design';
                    uploadPreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ff4444';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });

        if (!isValid) {
            alert('Please fill in all required fields.');
            return;
        }

        // Validate at least one tooth selected
        if (selectedTeeth.length === 0) {
            alert('Please select at least one tooth for your grillz.');
            return;
        }

        // Collect form data
        const formData = new FormData(form);
        const data = {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            locationSeen: formData.get('locationSeen'),
            budget: formData.get('budget'),
            selectedTeeth: selectedTeeth,
            material: formData.get('material'),
            stone: formData.get('stone'),
            karat: formData.get('karat'),
            designDescription: formData.get('designDescription')
        };

        // Send email notification (simulated)
        sendEmailNotification(data);
        
        // Show success message
        alert('Thank you! Your Mold Monday request has been submitted. You will receive a confirmation email shortly.');
        form.reset();
        selectedTeeth = [];
        updateSelectedTeethList();
        uploadPreview.innerHTML = '';
    });

    function sendEmailNotification(data) {
        // In a real implementation, this would send to your email service
        const emailData = {
            to: 'info@mrsprinklereno.com',
            subject: `New Mold Monday Request - ${data.fullName}`,
            body: `
                New Mold Monday Request:
                
                Name: ${data.fullName}
                Phone: ${data.phone}
                Email: ${data.email || 'Not provided'}
                
                Location Seen: ${data.locationSeen}
                Budget: ${data.budget}
                
                Selected Teeth: ${selectedTeeth.map(t => t.name).join(', ')}
                
                Material: ${data.material}
                Stone: ${data.stone || 'None'}
                Karat: ${data.karat || 'N/A'}
                
                Design Description: ${data.designDescription || 'Not provided'}
                
                Submitted at: ${new Date().toLocaleString()}
            `
        };
        
        console.log('Email notification would be sent:', emailData);
        
        // Simulate email sending
        setTimeout(() => {
            console.log('Email sent successfully to info@mrsprinklereno.com');
        }, 1000);
    }

    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#ff4444';
            } else {
                this.style.borderColor = '';
            }
        });
    });

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
        }
        e.target.value = value;
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
