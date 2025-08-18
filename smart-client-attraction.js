// AI-Powered Client Attraction System - Never Been Done Before in Grillz Industry
(function() {
    'use strict';
    
    let visitData = {
        timeOnSite: 0,
        scrollDepth: 0,
        interactions: [],
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        location: null,
        interests: [],
        priceRange: null,
        urgencyLevel: 0
    };
    
    // Geolocation for hyper-local targeting
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            visitData.location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // Check distance from Reno
            const renoLat = 39.5296, renoLng = -119.8138;
            const distance = Math.sqrt(
                Math.pow(visitData.location.lat - renoLat, 2) + 
                Math.pow(visitData.location.lng - renoLng, 2)
            ) * 69; // Convert to miles
            
            if (distance < 50) {
                setTimeout(showLocalOffer, 5000);
            } else if (distance < 200) {
                setTimeout(showRegionalOffer, 8000);
            }
        });
    }
    
    // Advanced scroll behavior analysis
    let scrollPattern = [];
    let lastScrollTime = Date.now();
    
    window.addEventListener('scroll', function() {
        const now = Date.now();
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        const scrollSpeed = Math.abs(window.scrollY - (scrollPattern[scrollPattern.length - 1]?.position || 0)) / (now - lastScrollTime);
        
        scrollPattern.push({
            position: window.scrollY,
            percent: scrollPercent,
            time: now,
            speed: scrollSpeed
        });
        
        if (scrollPattern.length > 10) scrollPattern.shift();
        
        visitData.scrollDepth = Math.max(visitData.scrollDepth, scrollPercent);
        lastScrollTime = now;
        
        // Detect reading vs skimming behavior
        if (scrollSpeed < 0.5 && scrollPercent > 30 && !sessionStorage.getItem('readerOffer')) {
            setTimeout(showReaderEngagementOffer, 3000);
            sessionStorage.setItem('readerOffer', 'shown');
        }
        
        // Gallery engagement detection
        if (scrollPercent > 60 && scrollPercent < 80 && !sessionStorage.getItem('galleryOffer')) {
            setTimeout(showGalleryEngagementOffer, 2000);
            sessionStorage.setItem('galleryOffer', 'shown');
        }
    });
    
    // Time-based engagement tracking
    let startTime = Date.now();
    let engagementScore = 0;
    
    setInterval(function() {
        visitData.timeOnSite = Math.round((Date.now() - startTime) / 1000);
        
        // Calculate engagement score
        engagementScore = (visitData.timeOnSite / 60) + (visitData.scrollDepth / 10) + (visitData.interactions.length * 5);
        
        // High-value visitor detection
        if (visitData.timeOnSite > 120 && engagementScore > 50 && !sessionStorage.getItem('vipOffer')) {
            showVIPOffer();
            sessionStorage.setItem('vipOffer', 'shown');
        }
        
        // Urgency building
        if (visitData.timeOnSite > 300) { // 5 minutes
            visitData.urgencyLevel = Math.min(3, Math.floor(visitData.timeOnSite / 300));
        }
    }, 1000);
    
    // Interest detection through hover patterns and clicks
    document.addEventListener('DOMContentLoaded', function() {
        // Service interest tracking
        document.querySelectorAll('.service-card').forEach((card, index) => {
            let hoverTime = 0;
            let hoverStart;
            
            card.addEventListener('mouseenter', function() {
                hoverStart = Date.now();
            });
            
            card.addEventListener('mouseleave', function() {
                if (hoverStart) {
                    hoverTime = Date.now() - hoverStart;
                    if (hoverTime > 2000) {
                        const service = this.querySelector('h3')?.textContent || `service-${index}`;
                        if (!visitData.interests.includes(service)) {
                            visitData.interests.push(service);
                        }
                    }
                }
            });
            
            card.addEventListener('click', function() {
                visitData.interactions.push({
                    type: 'service_click',
                    element: this.querySelector('h3')?.textContent,
                    time: Date.now()
                });
            });
        });
        
        // Price sensitivity detection
        document.querySelectorAll('[data-price], .budget, .pricing').forEach(element => {
            element.addEventListener('mouseenter', function() {
                visitData.priceRange = this.textContent.match(/\$[\d,]+/g)?.[0] || 'unknown';
            });
        });
        
        // Gallery engagement
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', function() {
                visitData.interactions.push({
                    type: 'gallery_view',
                    time: Date.now()
                });
            });
        });
    });
    
    // Exit intent with smart timing
    let exitIntentShown = false;
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && !exitIntentShown && visitData.timeOnSite > 30) {
            showSmartExitIntent();
            exitIntentShown = true;
        }
    });
    
    // Mobile-specific exit intent (scroll to top quickly)
    if (visitData.deviceType === 'mobile') {
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', function() {
            if (window.scrollY < lastScrollY - 100 && window.scrollY < 200 && !exitIntentShown && visitData.timeOnSite > 45) {
                showSmartExitIntent();
                exitIntentShown = true;
            }
            lastScrollY = window.scrollY;
        });
    }
    
    // Smart offer functions
    function showLocalOffer() {
        if (sessionStorage.getItem('localOffer')) return;
        
        const offer = createOffer({
            title: '🎯 LOCAL RENO DETECTED!',
            message: 'You\'re in our service area! Get 15% off + FREE mobile service to your location!',
            cta: 'Claim Local Deal',
            action: () => {
                gtag('event', 'local_offer_click', {'event_category': 'Conversion'});
                scrollToForm();
            },
            style: 'local'
        });
        
        sessionStorage.setItem('localOffer', 'shown');
    }
    
    function showRegionalOffer() {
        if (sessionStorage.getItem('regionalOffer')) return;
        
        const offer = createOffer({
            title: '🚗 REGIONAL SERVICE AVAILABLE',
            message: 'We travel to your area! Book now and get priority scheduling + travel discount.',
            cta: 'Check Availability',
            action: () => {
                gtag('event', 'regional_offer_click', {'event_category': 'Conversion'});
                window.open('sms:+15302140676?body=I\'m interested in regional service. My location is approximately ' + Math.round(distance) + ' miles from Reno.', '_blank');
            },
            style: 'regional'
        });
        
        sessionStorage.setItem('regionalOffer', 'shown');
    }
    
    function showReaderEngagementOffer() {
        const interests = visitData.interests.length > 0 ? visitData.interests.join(' & ') : 'custom grillz';
        
        const offer = createOffer({
            title: '💎 I SEE YOU\'RE RESEARCHING ' + interests.toUpperCase(),
            message: 'Get a FREE 3D preview of your custom design before you commit! No obligation.',
            cta: 'Get FREE Preview',
            action: () => {
                gtag('event', 'reader_engagement', {'event_category': 'Conversion'});
                document.querySelector('a[href="tel:+15302140676"]').click();
            },
            style: 'engagement'
        });
    }
    
    function showGalleryEngagementOffer() {
        const offer = createOffer({
            title: '🔥 LOVING OUR WORK?',
            message: 'Get the same quality! Book your consultation now and mention "GALLERY" for 10% off.',
            cta: 'Book Now',
            action: () => {
                gtag('event', 'gallery_engagement', {'event_category': 'Conversion'});
                scrollToForm();
            },
            style: 'gallery'
        });
    }
    
    function showVIPOffer() {
        const offer = createOffer({
            title: '👑 VIP TREATMENT UNLOCKED',
            message: `You've spent ${Math.round(visitData.timeOnSite/60)} minutes researching - you deserve VIP service! Get priority booking + exclusive design consultation.`,
            cta: 'Claim VIP Status',
            action: () => {
                gtag('event', 'vip_offer_click', {'event_category': 'Conversion'});
                window.open('sms:+15302140676?body=I want VIP treatment! I\'ve been researching your work and I\'m ready for the best service.', '_blank');
            },
            style: 'vip'
        });
    }
    
    function showSmartExitIntent() {
        const urgencyText = visitData.urgencyLevel > 0 ? 
            `This ${visitData.urgencyLevel === 1 ? 'week' : visitData.urgencyLevel === 2 ? 'month' : 'year'} only!` : 
            'Limited time!';
            
        const personalizedMessage = visitData.interests.length > 0 ? 
            `Don't miss out on your ${visitData.interests[0]} dreams!` : 
            'Don\'t leave without your FREE consultation!';
        
        const offer = createOffer({
            title: '🚨 WAIT! ' + personalizedMessage,
            message: `${urgencyText} Text "SPRINKLE ME" now for instant quote + 15% discount!`,
            cta: 'Text Now - Save 15%',
            action: () => {
                gtag('event', 'exit_intent_conversion', {'event_category': 'Conversion'});
                window.open('sms:+15302140676?body=SPRINKLE ME - I want the 15% discount!', '_blank');
            },
            style: 'exit',
            modal: true
        });
    }
    
    // Universal offer creator
    function createOffer({title, message, cta, action, style, modal = false}) {
        const styles = {
            local: 'background: linear-gradient(45deg, #FFD700, #FFA500); color: #000;',
            regional: 'background: linear-gradient(45deg, #1E90FF, #0066CC); color: #fff;',
            engagement: 'background: linear-gradient(45deg, #32CD32, #228B22); color: #fff;',
            gallery: 'background: linear-gradient(45deg, #FF6347, #DC143C); color: #fff;',
            vip: 'background: linear-gradient(45deg, #8A2BE2, #4B0082); color: #fff;',
            exit: 'background: linear-gradient(45deg, #FFD700, #FFA500); color: #000;'
        };
        
        const offerElement = document.createElement('div');
        
        if (modal) {
            offerElement.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                    <div style="${styles[style]} padding: 40px; border-radius: 20px; max-width: 500px; text-align: center; position: relative; animation: bounceIn 0.6s ease-out;">
                        <div style="position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 24px; font-weight: bold;" onclick="this.parentElement.parentElement.parentElement.remove();">×</div>
                        <div style="font-size: 24px; font-weight: bold; margin-bottom: 15px;">${title}</div>
                        <div style="font-size: 16px; margin-bottom: 25px;">${message}</div>
                        <button onclick="(${action.toString()})(); this.parentElement.parentElement.parentElement.remove();" style="background: ${style === 'exit' ? '#000' : '#FFD700'}; color: ${style === 'exit' ? '#FFD700' : '#000'}; border: none; padding: 15px 30px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 16px; margin-right: 15px;">${cta}</button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove();" style="background: transparent; border: 2px solid ${style === 'exit' ? '#000' : '#fff'}; color: ${style === 'exit' ? '#000' : '#fff'}; padding: 15px 30px; border-radius: 10px; cursor: pointer;">Later</button>
                    </div>
                </div>
            `;
        } else {
            const position = Math.random() > 0.5 ? 'top: 20px; right: 20px;' : 'bottom: 20px; left: 20px;';
            offerElement.innerHTML = `
                <div style="position: fixed; ${position} ${styles[style]} padding: 20px; border-radius: 15px; z-index: 9999; max-width: 350px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); animation: slideIn 0.5s ease-out;">
                    <div style="font-weight: bold; margin-bottom: 8px;">${title}</div>
                    <div style="font-size: 14px; margin-bottom: 12px;">${message}</div>
                    <button onclick="(${action.toString()})(); this.parentElement.parentElement.remove();" style="background: ${style === 'local' ? '#000' : '#FFD700'}; color: ${style === 'local' ? '#FFD700' : '#000'}; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; margin-right: 10px; font-weight: bold;">${cta}</button>
                    <button onclick="this.parentElement.parentElement.remove();" style="background: transparent; border: 1px solid ${style === 'local' ? '#000' : '#fff'}; color: ${style === 'local' ? '#000' : '#fff'}; padding: 10px 15px; border-radius: 5px; cursor: pointer;">Close</button>
                </div>
            `;
        }
        
        document.body.appendChild(offerElement);
        
        // Auto-remove after 8 seconds if not modal
        if (!modal) {
            setTimeout(() => {
                if (offerElement.parentNode) {
                    offerElement.style.animation = 'slideOut 0.5s ease-in';
                    setTimeout(() => offerElement.remove(), 500);
                }
            }, 8000);
        }
        
        return offerElement;
    }
    
    // Add required CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Helper function for form scrolling
    window.scrollToForm = function() {
        const form = document.querySelector('.lead-capture-form') || document.querySelector('#contact');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
})();