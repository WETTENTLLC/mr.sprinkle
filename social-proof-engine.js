// Revolutionary Social Proof Engine - Industry First for Grillz Business
(function() {
    'use strict';
    
    // Real-time social proof messages with Nevada locations
    const socialProofData = [
        {
            type: 'order',
            messages: [
                '🔥 Someone in Reno just ordered 18K diamond grillz!',
                '💎 New order: Custom gold grillz with sapphires - Sparks, NV',
                '⭐ Fresh order: Full set platinum grillz - Carson City',
                '🎯 Mobile service booked for Lake Tahoe this weekend!',
                '💰 Someone just ordered $3,200 custom grillz set!',
                '🏆 VIP client ordered matching grillz & gold nails - Reno',
                '🔥 Rush order: Wedding grillz for this Saturday - Sparks',
                '💎 Celebrity-style diamond grillz ordered - Incline Village'
            ],
            frequency: 0.4
        },
        {
            type: 'review',
            messages: [
                '⭐⭐⭐⭐⭐ "Best grillz in Nevada!" - Marcus, Carson City',
                '⭐⭐⭐⭐⭐ "Amazing quality, fast service!" - Sarah, Reno',
                '⭐⭐⭐⭐⭐ "Mr. Sprinkle is the GOAT!" - DJ Mike, Sparks',
                '⭐⭐⭐⭐⭐ "Perfect fit, perfect shine!" - Lisa, Lake Tahoe',
                '⭐⭐⭐⭐⭐ "Worth every penny!" - Carlos, Reno',
                '⭐⭐⭐⭐⭐ "Mobile service was incredible!" - Ashley, Carson City'
            ],
            frequency: 0.3
        },
        {
            type: 'savings',
            messages: [
                '💰 Someone just saved $200 with our current special!',
                '🎉 Local discount claimed: 15% off mobile service!',
                '💸 VIP client saved $350 on diamond upgrade!',
                '🔥 Early bird special claimed - $100 saved!',
                '💎 Bundle deal activated: Grillz + Nails = 20% off!'
            ],
            frequency: 0.2
        },
        {
            type: 'urgency',
            messages: [
                '⏰ Only 3 mobile appointments left this week!',
                '🚨 Limited: 2 VIP consultation slots remaining!',
                '⚡ Flash sale ends in 4 hours - 15% off everything!',
                '🔥 Weekend special: Book by Friday for 10% off!',
                '⏳ Last chance: Free diamond upgrade expires tonight!'
            ],
            frequency: 0.1
        }
    ];
    
    // Advanced visitor tracking for personalized social proof
    let visitorProfile = {
        timeOnSite: 0,
        pageViews: 1,
        interests: [],
        priceRange: null,
        location: null,
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
    };
    
    // Track visitor behavior for personalized social proof
    function trackVisitorBehavior() {
        // Track time on site
        let startTime = Date.now();
        setInterval(() => {
            visitorProfile.timeOnSite = Math.round((Date.now() - startTime) / 1000);
        }, 1000);
        
        // Track interests based on hover/click patterns
        document.addEventListener('DOMContentLoaded', function() {
            // Service interest tracking
            document.querySelectorAll('.service-card').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    const service = this.querySelector('h3')?.textContent;
                    if (service && !visitorProfile.interests.includes(service)) {
                        visitorProfile.interests.push(service);
                    }
                });
            });
            
            // Price range detection
            document.querySelectorAll('[data-price], .budget, select[name="budget"]').forEach(element => {
                element.addEventListener('focus', function() {
                    visitorProfile.priceRange = this.value || this.textContent.match(/\$[\d,]+/)?.[0];
                });
            });
        });
        
        // Geolocation for location-based social proof
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                visitorProfile.location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
            });
        }
    }
    
    // Smart social proof selector based on visitor profile
    function getPersonalizedSocialProof() {
        let availableMessages = [];
        
        // Add all message types with their frequencies
        socialProofData.forEach(category => {
            if (Math.random() < category.frequency) {
                availableMessages = availableMessages.concat(category.messages);
            }
        });
        
        // Personalize based on visitor interests
        if (visitorProfile.interests.length > 0) {
            const interest = visitorProfile.interests[0].toLowerCase();
            if (interest.includes('gold')) {
                availableMessages.unshift('🔥 Someone just like you ordered custom gold grillz!');
            } else if (interest.includes('nail')) {
                availableMessages.unshift('💅 Gold nail enthusiast just placed an order!');
            }
        }
        
        // Personalize based on time on site
        if (visitorProfile.timeOnSite > 120) {
            availableMessages.unshift('💎 Serious buyer alert: Premium grillz order just placed!');
        }
        
        // Personalize based on device type
        if (visitorProfile.deviceType === 'mobile') {
            availableMessages.push('📱 Mobile order completed: "So easy to order!"');
        }
        
        return availableMessages[Math.floor(Math.random() * availableMessages.length)];
    }
    
    // Create and show social proof notification
    function showSocialProofNotification() {
        // Don't show if user is actively filling out a form
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            return;
        }
        
        const message = getPersonalizedSocialProof();
        if (!message) return;
        
        const notification = document.createElement('div');
        const isLeft = Math.random() > 0.5;
        const timeAgo = Math.floor(Math.random() * 10) + 1;
        
        notification.innerHTML = `
            <div style="
                position: fixed; 
                ${isLeft ? 'left: 20px;' : 'right: 20px;'} 
                bottom: 20px; 
                background: rgba(0,0,0,0.95); 
                color: #FFD700; 
                padding: 15px 20px; 
                border-radius: 12px; 
                z-index: 9998; 
                max-width: 320px; 
                border: 1px solid #FFD700; 
                box-shadow: 0 4px 20px rgba(255,215,0,0.3);
                animation: socialSlideIn 0.6s ease-out;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" onclick="this.remove(); scrollToForm();">
                <div style="font-size: 14px; line-height: 1.4; margin-bottom: 5px;">${message}</div>
                <div style="font-size: 12px; color: #1E90FF; display: flex; justify-content: space-between; align-items: center;">
                    <span>${timeAgo} minute${timeAgo > 1 ? 's' : ''} ago</span>
                    <span style="font-size: 10px; opacity: 0.8;">Click to get yours →</span>
                </div>
                <div style="position: absolute; top: 5px; right: 8px; font-size: 16px; opacity: 0.6; cursor: pointer;" onclick="event.stopPropagation(); this.parentElement.parentElement.remove();">×</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 6 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'socialSlideOut 0.5s ease-in';
                setTimeout(() => notification.remove(), 500);
            }
        }, 6000);
        
        // Track interaction
        if (typeof gtag !== 'undefined') {
            gtag('event', 'social_proof_shown', {
                'event_category': 'Engagement',
                'event_label': message.substring(0, 50)
            });
        }
    }
    
    // Live visitor counter (simulated but realistic)
    function showLiveVisitorCount() {
        if (sessionStorage.getItem('visitorCountShown')) return;
        
        const baseCount = 12; // Base realistic number
        const timeVariation = Math.floor(Math.sin(Date.now() / 300000) * 3); // Varies over 5 minutes
        const randomVariation = Math.floor(Math.random() * 5);
        const currentCount = baseCount + timeVariation + randomVariation;
        
        const counter = document.createElement('div');
        counter.innerHTML = `
            <div style="
                position: fixed; 
                top: 20px; 
                left: 50%; 
                transform: translateX(-50%); 
                background: linear-gradient(45deg, #1E90FF, #0066CC); 
                color: white; 
                padding: 10px 20px; 
                border-radius: 25px; 
                z-index: 9997; 
                font-size: 13px; 
                font-weight: bold;
                animation: socialSlideIn 0.6s ease-out;
                box-shadow: 0 2px 10px rgba(30,144,255,0.4);
            ">
                🔴 ${currentCount} people viewing this page right now
            </div>
        `;
        
        document.body.appendChild(counter);
        sessionStorage.setItem('visitorCountShown', 'true');
        
        // Remove after 8 seconds
        setTimeout(() => {
            if (counter.parentNode) {
                counter.style.animation = 'socialSlideOut 0.5s ease-in';
                setTimeout(() => counter.remove(), 500);
            }
        }, 8000);
    }
    
    // Recent activity ticker
    function showRecentActivityTicker() {
        if (sessionStorage.getItem('activityTickerShown')) return;
        
        const activities = [
            'Marcus from Reno just got his mold done',
            'Sarah booked mobile service for tomorrow',
            'DJ Mike ordered diamond grillz upgrade',
            'Lisa scheduled consultation for Friday',
            'Carlos just paid deposit for custom set'
        ];
        
        const activity = activities[Math.floor(Math.random() * activities.length)];
        
        const ticker = document.createElement('div');
        ticker.innerHTML = `
            <div style="
                position: fixed; 
                bottom: 0; 
                left: 0; 
                width: 100%; 
                background: linear-gradient(90deg, #FFD700, #FFA500); 
                color: #000; 
                padding: 8px 0; 
                text-align: center; 
                font-weight: bold; 
                font-size: 14px;
                z-index: 9996;
                animation: tickerSlide 0.8s ease-out;
            ">
                ⚡ LIVE: ${activity} • 
                <span style="cursor: pointer; text-decoration: underline;" onclick="this.parentElement.parentElement.remove(); scrollToForm();">
                    Get yours now!
                </span>
                <span style="float: right; margin-right: 20px; cursor: pointer; opacity: 0.7;" onclick="this.parentElement.parentElement.remove();">×</span>
            </div>
        `;
        
        document.body.appendChild(ticker);
        sessionStorage.setItem('activityTickerShown', 'true');
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (ticker.parentNode) {
                ticker.style.animation = 'tickerSlideOut 0.5s ease-in';
                setTimeout(() => ticker.remove(), 500);
            }
        }, 5000);
    }
    
    // Scarcity notifications
    function showScarcityNotification() {
        if (Math.random() > 0.3) return; // 30% chance
        
        const scarcityMessages = [
            '⚠️ Only 2 VIP slots left this week!',
            '🔥 Limited: 3 mobile appointments remaining!',
            '⏰ Weekend special ends in 6 hours!',
            '💎 Last chance: Free upgrade expires tonight!',
            '🚨 High demand: Book now to avoid waiting list!'
        ];
        
        const message = scarcityMessages[Math.floor(Math.random() * scarcityMessages.length)];
        
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed; 
                top: 50%; 
                right: -300px; 
                transform: translateY(-50%); 
                background: linear-gradient(45deg, #FF4500, #DC143C); 
                color: white; 
                padding: 15px 20px; 
                border-radius: 10px 0 0 10px; 
                z-index: 9995; 
                max-width: 280px;
                animation: scarcitySlideIn 0.8s ease-out forwards;
                cursor: pointer;
            " onclick="this.remove(); scrollToForm();">
                <div style="font-weight: bold; margin-bottom: 5px;">${message}</div>
                <div style="font-size: 12px; opacity: 0.9;">Click to secure your spot →</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 7 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'scarcitySlideOut 0.8s ease-in forwards';
                setTimeout(() => notification.remove(), 800);
            }
        }, 7000);
    }
    
    // Add all required CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes socialSlideIn {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes socialSlideOut {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100%); opacity: 0; }
        }
        @keyframes tickerSlide {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        @keyframes tickerSlideOut {
            from { transform: translateY(0); }
            to { transform: translateY(100%); }
        }
        @keyframes scarcitySlideIn {
            from { right: -300px; }
            to { right: 0px; }
        }
        @keyframes scarcitySlideOut {
            from { right: 0px; }
            to { right: -300px; }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize the system
    function initSocialProofEngine() {
        trackVisitorBehavior();
        
        // Show initial visitor count after 3 seconds
        setTimeout(showLiveVisitorCount, 3000);
        
        // Show first social proof after 8 seconds
        setTimeout(showSocialProofNotification, 8000);
        
        // Show activity ticker after 15 seconds
        setTimeout(showRecentActivityTicker, 15000);
        
        // Regular social proof notifications every 12-18 seconds
        setInterval(() => {
            if (Math.random() > 0.4) { // 60% chance each interval
                showSocialProofNotification();
            }
        }, 15000);
        
        // Scarcity notifications every 25-35 seconds
        setInterval(showScarcityNotification, 30000);
        
        // Update visitor count every 2 minutes
        setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance
                showLiveVisitorCount();
            }
        }, 120000);
    }
    
    // Start the engine when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSocialProofEngine);
    } else {
        initSocialProofEngine();
    }
    
})();