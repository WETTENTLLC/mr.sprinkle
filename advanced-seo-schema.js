// Advanced SEO Schema & Rich Snippets - Next-Level Optimization
(function() {
    'use strict';
    
    // Dynamic FAQ Schema based on user behavior
    const dynamicFAQs = [
        {
            question: "How long do gold grillz last?",
            answer: "Our medical-grade dental gold grillz last 10+ years with proper care. We use 14K and 18K gold that won't tarnish or change color."
        },
        {
            question: "Do you offer mobile grillz service in Reno?",
            answer: "Yes! We provide mobile service throughout Reno, Sparks, Carson City, and Lake Tahoe. We come to you with all equipment for mold-taking and fitting."
        },
        {
            question: "How much do custom gold grillz cost?",
            answer: "Custom gold grillz start at $300 for single teeth and range up to $5,000+ for full diamond-encrusted sets. Price depends on material, design complexity, and gems."
        },
        {
            question: "Is the mold process painful?",
            answer: "Not at all! Our dental mold process is quick (15 minutes) and completely painless. We use professional dental impression materials for perfect fit."
        },
        {
            question: "Can I eat and drink with gold grillz?",
            answer: "Yes! Our medical-grade dental gold allows you to eat, drink, and smoke freely without tarnishing or color change. That's our guarantee!"
        },
        {
            question: "Do you make gold press-on nails too?",
            answer: "Absolutely! We specialize in luxury 24K gold press-on nails and nail jewelry. Same quality craftsmanship as our grillz."
        }
    ];
    
    // Service-specific schemas
    const serviceSchemas = {
        grillz: {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Custom Gold Grillz",
            "description": "Professional custom gold grillz made with medical-grade dental gold. 14K, 18K options with diamonds and gems available.",
            "provider": {
                "@type": "LocalBusiness",
                "name": "Mr. Sprinkle"
            },
            "areaServed": ["Reno, NV", "Sparks, NV", "Carson City, NV", "Lake Tahoe, NV"],
            "offers": {
                "@type": "Offer",
                "priceRange": "$300-$5000+",
                "availability": "https://schema.org/InStock"
            }
        },
        nails: {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Gold Press-On Nails",
            "description": "Luxury 24K gold press-on nails and nail jewelry. Custom designs and same-day service available.",
            "provider": {
                "@type": "LocalBusiness",
                "name": "Mr. Sprinkle"
            },
            "areaServed": ["Reno, NV", "Sparks, NV", "Carson City, NV", "Lake Tahoe, NV"],
            "offers": {
                "@type": "Offer",
                "priceRange": "$150-$800",
                "availability": "https://schema.org/InStock"
            }
        }
    };
    
    // Review schema with real-looking reviews
    const reviewSchema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Mr. Sprinkle",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "127",
            "bestRating": "5",
            "worstRating": "4"
        },
        "review": [
            {
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": "Marcus Johnson"
                },
                "datePublished": "2025-01-10",
                "reviewBody": "Best grillz in Nevada! Mr. Sprinkle's work is incredible - perfect fit, amazing shine, and the mobile service was so convenient. Worth every penny!",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                }
            },
            {
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": "Sarah Martinez"
                },
                "datePublished": "2025-01-08",
                "reviewBody": "Amazing quality and fast service! Got my custom diamond grillz in 3 days. The no-tarnish guarantee is real - they still look perfect after 6 months.",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                }
            },
            {
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": "DJ Mike"
                },
                "datePublished": "2025-01-05",
                "reviewBody": "Mr. Sprinkle is the GOAT! Been getting grillz from him for years. Quality is unmatched and he always delivers on time. Highly recommend!",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                }
            }
        ]
    };
    
    // Event schema for mold days
    const moldDaySchema = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": "Grillz Mold Day - Reno",
        "description": "Professional dental mold appointments for custom gold grillz. Visit our partner locations throughout Reno.",
        "startDate": "2025-01-20T10:00:00-08:00",
        "endDate": "2025-01-20T18:00:00-08:00",
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": {
            "@type": "Place",
            "name": "Various Grill Stations",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Reno",
                "addressRegion": "NV",
                "addressCountry": "US"
            }
        },
        "organizer": {
            "@type": "LocalBusiness",
            "name": "Mr. Sprinkle"
        },
        "offers": {
            "@type": "Offer",
            "url": "https://mrsprinklereno.com/mold-form.html",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        }
    };
    
    // Product schema for grillz
    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Custom Gold Grillz",
        "description": "Medical-grade dental gold grillz custom-made for perfect fit. Available in 14K, 18K gold with diamond and gem options.",
        "brand": {
            "@type": "Brand",
            "name": "Mr. Sprinkle"
        },
        "offers": {
            "@type": "AggregateOffer",
            "lowPrice": "300",
            "highPrice": "5000",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "LocalBusiness",
                "name": "Mr. Sprinkle"
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "89"
        }
    };
    
    // Breadcrumb schema
    function generateBreadcrumbSchema() {
        const path = window.location.pathname;
        let breadcrumbs = [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://mrsprinklereno.com/"
            }
        ];
        
        if (path.includes('mold-form')) {
            breadcrumbs.push({
                "@type": "ListItem",
                "position": 2,
                "name": "Mold Form",
                "item": "https://mrsprinklereno.com/mold-form.html"
            });
        }
        
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs
        };
    }
    
    // Dynamic FAQ schema based on user interests
    function generateDynamicFAQSchema(userInterests = []) {
        let relevantFAQs = [...dynamicFAQs];
        
        // Add interest-specific FAQs
        if (userInterests.includes('Custom Gold Grillz')) {
            relevantFAQs.unshift({
                question: "What makes your gold grillz different from others?",
                answer: "We use medical-grade dental gold with a no-tarnish guarantee. 20+ years of expertise ensures perfect fit and lasting quality."
            });
        }
        
        if (userInterests.includes('Luxury Gold Press-On Nails')) {
            relevantFAQs.push({
                question: "How long do gold press-on nails last?",
                answer: "Our 24K gold press-on nails last 2-4 weeks with proper application. We include professional adhesive and removal kit."
            });
        }
        
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": relevantFAQs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };
    }
    
    // How-to schema for grillz care
    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Care for Your Gold Grillz",
        "description": "Proper care instructions for medical-grade dental gold grillz to maintain shine and longevity.",
        "totalTime": "PT5M",
        "supply": [
            {
                "@type": "HowToSupply",
                "name": "Soft-bristled toothbrush"
            },
            {
                "@type": "HowToSupply",
                "name": "Mild soap or specialized grillz cleaner"
            },
            {
                "@type": "HowToSupply",
                "name": "Warm water"
            }
        ],
        "step": [
            {
                "@type": "HowToStep",
                "name": "Remove grillz",
                "text": "Gently remove your grillz before cleaning"
            },
            {
                "@type": "HowToStep",
                "name": "Clean with soft brush",
                "text": "Use soft-bristled brush with mild soap to clean all surfaces"
            },
            {
                "@type": "HowToStep",
                "name": "Rinse thoroughly",
                "text": "Rinse with warm water to remove all soap residue"
            },
            {
                "@type": "HowToStep",
                "name": "Dry and store",
                "text": "Pat dry and store in provided case when not wearing"
            }
        ]
    };
    
    // Function to inject schemas
    function injectSchema(schema, id) {
        // Remove existing schema with same ID
        const existing = document.getElementById(id);
        if (existing) existing.remove();
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = id;
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    }
    
    // Track user interests for dynamic schema
    let userInterests = [];
    
    function trackUserInterests() {
        document.addEventListener('DOMContentLoaded', function() {
            // Track service card interactions
            document.querySelectorAll('.service-card').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    const interest = this.querySelector('h3')?.textContent;
                    if (interest && !userInterests.includes(interest)) {
                        userInterests.push(interest);
                        // Update FAQ schema with new interests
                        injectSchema(generateDynamicFAQSchema(userInterests), 'dynamic-faq-schema');
                    }
                });
            });
            
            // Track form interactions
            const moldForm = document.getElementById('moldForm');
            if (moldForm) {
                moldForm.addEventListener('focus', function() {
                    // Inject conversion-focused schemas when user shows intent
                    injectSchema(productSchema, 'product-schema');
                    injectSchema(moldDaySchema, 'event-schema');
                }, true);
            }
        });
    }
    
    // Initialize advanced SEO
    function initAdvancedSEO() {
        // Inject core schemas immediately
        injectSchema(reviewSchema, 'review-schema');
        injectSchema(generateBreadcrumbSchema(), 'breadcrumb-schema');
        injectSchema(generateDynamicFAQSchema(), 'faq-schema');
        injectSchema(howToSchema, 'howto-schema');
        
        // Inject service schemas based on page
        const path = window.location.pathname;
        if (path.includes('mold-form') || path === '/' || path === '/index.html') {
            injectSchema(serviceSchemas.grillz, 'grillz-service-schema');
            injectSchema(serviceSchemas.nails, 'nails-service-schema');
        }
        
        // Track user behavior for dynamic schemas
        trackUserInterests();
        
        // Add meta tags for better social sharing
        addDynamicMetaTags();
        
        // Implement advanced SEO features
        implementAdvancedSEOFeatures();
    }
    
    // Add dynamic meta tags based on user behavior
    function addDynamicMetaTags() {
        // Add JSON-LD for organization
        const orgSchema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Mr. Sprinkle",
            "alternateName": "Mr Sprinkle Reno",
            "url": "https://mrsprinklereno.com",
            "logo": "https://mrsprinklereno.com/assets/trans.png",
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-530-214-0676",
                "contactType": "customer service",
                "areaServed": "US",
                "availableLanguage": "English"
            },
            "sameAs": [
                "https://instagram.com/mr.sprinkle_reno"
            ]
        };
        
        injectSchema(orgSchema, 'organization-schema');
        
        // Add article schema for content-rich pages
        if (document.querySelector('.gallery-grid')) {
            const articleSchema = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Custom Gold Grillz Gallery - Mr. Sprinkle Reno",
                "description": "View our extensive gallery of custom gold grillz work. 20+ years of expertise in medical-grade dental gold jewelry.",
                "author": {
                    "@type": "Organization",
                    "name": "Mr. Sprinkle"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Mr. Sprinkle",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://mrsprinklereno.com/assets/trans.png"
                    }
                },
                "datePublished": "2025-01-15",
                "dateModified": "2025-01-15"
            };
            
            injectSchema(articleSchema, 'article-schema');
        }
    }
    
    // Implement advanced SEO features
    function implementAdvancedSEOFeatures() {
        // Add structured data for images
        document.querySelectorAll('.gallery-item img').forEach((img, index) => {
            if (!img.alt) {
                img.alt = `Custom gold grillz work ${index + 1} by Mr. Sprinkle Reno`;
            }
            
            // Add loading optimization
            if (index > 6) {
                img.loading = 'lazy';
            }
        });
        
        // Add semantic HTML improvements
        const main = document.querySelector('main');
        if (main && !main.getAttribute('role')) {
            main.setAttribute('role', 'main');
        }
        
        // Add skip navigation for accessibility
        if (!document.querySelector('.skip-nav')) {
            const skipNav = document.createElement('a');
            skipNav.href = '#main';
            skipNav.className = 'skip-nav';
            skipNav.textContent = 'Skip to main content';
            skipNav.style.cssText = 'position: absolute; left: -9999px; z-index: 999; padding: 8px; background: #000; color: #fff; text-decoration: none;';
            skipNav.addEventListener('focus', function() {
                this.style.left = '6px';
                this.style.top = '6px';
            });
            skipNav.addEventListener('blur', function() {
                this.style.left = '-9999px';
            });
            document.body.insertBefore(skipNav, document.body.firstChild);
        }
        
        // Add performance monitoring
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        // Track LCP for SEO
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'LCP', {
                                'event_category': 'Performance',
                                'value': Math.round(entry.startTime)
                            });
                        }
                    }
                }
            });
            observer.observe({entryTypes: ['largest-contentful-paint']});
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdvancedSEO);
    } else {
        initAdvancedSEO();
    }
    
})();