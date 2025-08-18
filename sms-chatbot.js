// 🤖 INTELLIGENT SMS CHATBOT SYSTEM
// Responds to keywords and sends forms/documents automatically

const fs = require('fs');
const path = require('path');

class SMSChatbot {
    constructor() {
        this.conversations = new Map();
        this.keywords = this.setupKeywords();
        this.forms = this.setupForms();
        this.responses = this.setupResponses();
        
        console.log('🤖 SMS Chatbot initialized and ready');
        this.startListening();
    }

    setupKeywords() {
        return {
            // Booking keywords
            booking: ['sprinkle me', 'book', 'appointment', 'mold', 'schedule', 'consultation'],
            
            // Service keywords
            grillz: ['grillz', 'grill', 'gold teeth', 'teeth', 'dental gold'],
            nails: ['nails', 'gold nails', 'press on', 'nail armor', 'manicure'],
            
            // Info keywords
            pricing: ['price', 'cost', 'how much', 'pricing', 'rates', 'quote'],
            location: ['where', 'location', 'address', 'directions', 'find you'],
            hours: ['hours', 'open', 'closed', 'when', 'time', 'schedule'],
            
            // Process keywords
            process: ['how', 'process', 'procedure', 'steps', 'what happens'],
            materials: ['material', 'gold', '14k', '18k', 'quality', 'guarantee'],
            
            // Emergency keywords
            emergency: ['urgent', 'asap', 'emergency', 'rush', 'same day'],
            
            // General keywords
            help: ['help', 'info', 'information', 'questions', 'support'],
            
            // Ambassador keywords
            ambassador: ['grill girl', 'grillgirl', 'ambassador', 'model', 'collab', 'influencer']
        };
    }

    setupForms() {
        return {
            moldForm: {
                name: 'Dental Mold Form',
                url: 'https://mrsprinklereno.com/mold-form.html',
                description: 'Complete dental mold request form with tooth selection'
            },
            
            quoteForm: {
                name: 'Free Quote Form',
                url: 'https://mrsprinklereno.com/#contact',
                description: 'Get instant pricing for your custom grillz'
            },
            
            consultationForm: {
                name: 'Consultation Booking',
                url: 'https://calendly.com/mrsprinkle',
                description: 'Schedule your FREE consultation'
            },
            
            ambassadorForm: {
                name: 'Grill Girl Ambassador Application',
                url: 'https://forms.gle/MrSprinkleAmbassador',
                description: 'Complete ambassador application - 3 minutes'
            }
        };
    }

    setupResponses() {
        return {
            welcome: `🔥 Welcome to Mr. Sprinkle! 

I'm your AI assistant. I can help with:
📱 "SPRINKLE ME" - Book appointment
💰 "PRICING" - Get quotes  
📍 "LOCATION" - Find us
⏰ "HOURS" - Business hours
❓ "HELP" - More options

What can I help you with?`,

            booking: `🎉 Ready to get your custom grillz?

Here's how to book:

1️⃣ MOLD FORM: {moldFormUrl}
Select exactly which teeth you want

2️⃣ CONSULTATION: Text (530) 214-0676
FREE consultation via text

3️⃣ MOBILE SERVICE: We come to you!
Perfect for groups or privacy

Which option works best for you?`,

            pricing: `💰 CUSTOM GRILLZ PRICING

🎯 PERSONALIZED QUOTES ONLY:
Every grillz piece is custom-made, so pricing varies based on:
• Number of teeth
• Gold karat (14K, 18K)
• Diamonds/gems
• Custom designs
• Rush service

📱 TEXT FOR INSTANT QUOTE:
"I want [X] teeth in [gold type]"
Example: "I want 4 front teeth in 18K gold"

💎 WHAT WE GUARANTEE:
✅ Medical-grade dental gold (nickel-free)
✅ 0% tarnish guarantee
✅ Perfect custom fit
✅ 20+ years experience

⚠️ IMPORTANT: Grillz are cosmetic accessories. Purchase at your own risk. Consult dental professional before ordering.

📋 GET DETAILED QUOTE:
https://mrsprinklereno.com/#contact

Text your specific needs for instant pricing! 💎`,

            location: `📍 FIND MR. SPRINKLE

🏢 GRILL STATIONS:
We're setting up partner locations throughout Reno!
Barbershops, tattoo parlors & clothing stores

📱 MOBILE SERVICE AVAILABLE:
We come to YOU anywhere in:
• Reno • Sparks • Carson City
• Lake Tahoe • Washoe County

📱 TEXT FOR CURRENT LOCATIONS:
"Where can I find you?"
We'll send you the nearest available spot!

🗺️ MOBILE PREFERRED:
Most clients choose mobile service for privacy and convenience

Text your area for immediate location info! 📍`,

            hours: `⏰ BUSINESS HOURS

📅 GRILL STATIONS:
Monday-Saturday: 10am-8pm
Sunday: 12pm-6pm

🚗 MOBILE SERVICE:
7 Days a Week: 9am-9pm
(By appointment only)

📱 EMERGENCY/RUSH:
Text 24/7 for urgent requests
Additional fees apply

Text "BOOK" to schedule now!`,

            process: `🔧 HOW IT WORKS

1️⃣ CONSULTATION (FREE)
• Discuss your vision
• See our portfolio  
• Get exact pricing

2️⃣ MOLD TAKING (15 mins)
• Professional dental impression
• Completely painless
• Mobile service available

3️⃣ CUSTOM CREATION (2-4 days)
• Handcrafted by experts
• Medical-grade materials
• Quality guaranteed

4️⃣ FITTING & DELIVERY
• Perfect fit guaranteed
• Care instructions included
• Lifetime support

Ready to start? Text "SPRINKLE ME"!`,

            materials: `💎 MATERIALS & GUARANTEE

🏆 MEDICAL-GRADE DENTAL GOLD:
• 14K & 18K Yellow/Rose/White Gold
• Same quality used by dentists
• Biocompatible & safe

💍 PREMIUM ADDITIONS:
• Real diamonds (all grades)
• Precious gemstones
• Custom engravings/logos

🛡️ LIFETIME GUARANTEE:
✅ NO tarnishing EVER
✅ NO color change
✅ Eat, drink, smoke freely
✅ 20+ years proven quality

🔬 Lab-tested purity
📜 Authenticity certificates included`,

            emergency: `🚨 RUSH/EMERGENCY SERVICE

⚡ SAME DAY AVAILABLE:
• Simple single tooth: 4-6 hours
• Emergency repairs: 2-3 hours
• Rush fee: +50% of base price

🚗 MOBILE EMERGENCY:
• We come to you within 2 hours
• Available 24/7
• Perfect for events/performances

📱 TEXT NOW: (530) 214-0676
Text "EMERGENCY" for immediate service

💰 Rush pricing:
• Single tooth: $300-500
• Multiple teeth: $1500-3000
• Payment plans available`,

            help: `❓ HOW CAN I HELP?

📱 QUICK COMMANDS:
• "SPRINKLE ME" - Book appointment
• "PRICING" - See all prices
• "LOCATION" - Find us  
• "HOURS" - Business hours
• "PROCESS" - How it works
• "MATERIALS" - Gold info
• "EMERGENCY" - Rush service
• "NAILS" - Gold nail info

🤖 SMART FEATURES:
• Ask any question in plain English
• Get instant quotes
• Book appointments
• Receive forms automatically

💬 EXAMPLES:
• "How much for 4 gold teeth?"
• "Where are you located?"
• "I need grillz for tomorrow"
• "What's the process like?"

What would you like to know?`,

            nails: `💅 GOLD PRESS-ON NAILS "HAND JEWELRY"

✨ CUSTOM OPTIONS AVAILABLE:
• Classic French (gold tips)
• Full coverage gold
• Logo/custom designs
• Gemstone accents
• Custom artwork

⚡ SAME DAY SERVICE:
• Ready in 2-4 hours
• Perfect for events
• Mobile service available

💪 FEATURES:
• Reusable design
• Professional application
• Lasts 2-3 weeks
• Damage-free removal

📱 TEXT FOR QUOTE:
Describe your nail vision for custom pricing!

Ready to order? Text "BOOK NAILS"!`,

            ambassador: `✨ GRILL GIRL AMBASSADOR PROGRAM
"Reno's Shiniest Collab"

Thanks for shining with Mr. Sprinkle! ✨

🎯 AMBASSADOR BENEFITS:
✨ 50% OFF your dream grillz
✨ FREE Lake Tahoe photoshoot
✨ Earn 20% commission on referrals
✨ Exclusive events & networking
✨ Professional content creation

📋 COMPLETE APPLICATION (3 minutes):
https://forms.gle/MrSprinkleAmbassador

📸 REQUIREMENTS:
• Active Instagram/TikTok in Reno area
• 3 tagged posts per month
• 1 quarterly event attendance
• 50% grillz deposit due post-approval

⚡ We'll respond within 24 hours!

Ready to become Reno's next Grill Girl? 💎`
        };
    }

    // MAIN MESSAGE PROCESSING
    processIncomingMessage(phoneNumber, message) {
        const normalizedMessage = message.toLowerCase().trim();
        const conversation = this.getConversation(phoneNumber);
        
        console.log(`📱 Incoming from ${phoneNumber}: ${message}`);
        
        // Determine intent
        const intent = this.detectIntent(normalizedMessage);
        
        // Generate response
        const response = this.generateResponse(intent, normalizedMessage, conversation);
        
        // Update conversation
        this.updateConversation(phoneNumber, message, response, intent);
        
        // Send response
        this.sendResponse(phoneNumber, response);
        
        return response;
    }

    detectIntent(message) {
        // Special case for "grill girl" (case insensitive) - check first
        if (message.includes('grill girl') || message.includes('grillgirl')) {
            return 'ambassador';
        }
        
        // Check for exact keyword matches
        for (const [category, keywords] of Object.entries(this.keywords)) {
            if (keywords.some(keyword => message.includes(keyword))) {
                return category;
            }
        }
        
        // Check for question patterns
        if (message.includes('how much') || message.includes('cost')) return 'pricing';
        if (message.includes('where') || message.includes('location')) return 'location';
        if (message.includes('when') || message.includes('hours')) return 'hours';
        if (message.includes('how') && message.includes('work')) return 'process';
        
        // Default to help for unclear messages
        return 'help';
    }

    generateResponse(intent, message, conversation) {
        let response = this.responses[intent] || this.responses.help;
        
        // Personalize based on conversation history
        if (conversation.messageCount === 0) {
            response = this.responses.welcome + '\n\n' + response;
        }
        
        // Add forms/links where appropriate
        response = this.addRelevantForms(response, intent);
        
        // Add contextual information
        response = this.addContextualInfo(response, intent, message);
        
        // Special handling for ambassador applications
        if (intent === 'ambassador') {
            this.trackAmbassadorLead(conversation.phoneNumber, message);
        }
        
        return response;
    }

    addRelevantForms(response, intent) {
        switch (intent) {
            case 'booking':
                response = response.replace('{moldFormUrl}', this.forms.moldForm.url);
                response += `\n\n📋 FORMS:\n• Mold Form: ${this.forms.moldForm.url}\n• Quick Quote: ${this.forms.quoteForm.url}`;
                break;
                
            case 'pricing':
                response += `\n\n📋 GET EXACT QUOTE:\n${this.forms.quoteForm.url}`;
                break;
                
            case 'grillz':
                response += `\n\n📋 BOOK YOUR GRILLZ:\n${this.forms.moldForm.url}`;
                break;
                
            case 'ambassador':
                response = response.replace('https://forms.gle/MrSprinkleAmbassador', this.forms.ambassadorForm.url);
                break;
        }
        
        return response;
    }

    addContextualInfo(response, intent, message) {
        // Add specific info based on message content
        if (message.includes('diamond')) {
            response += '\n\n💎 DIAMOND INFO: We use real diamonds - VS1 clarity minimum. Prices vary by size and quality.';
        }
        
        if (message.includes('mobile')) {
            response += '\n\n🚗 MOBILE SERVICE: $50 travel fee within 25 miles. Groups of 3+ get free mobile service!';
        }
        
        if (message.includes('payment')) {
            response += '\n\n💳 PAYMENT: Cash, Card, Venmo, CashApp. Payment plans available for orders $500+';
        }
        
        return response;
    }

    // CONVERSATION MANAGEMENT
    getConversation(phoneNumber) {
        if (!this.conversations.has(phoneNumber)) {
            this.conversations.set(phoneNumber, {
                phoneNumber,
                messageCount: 0,
                lastMessage: null,
                lastResponse: null,
                intent: null,
                startTime: new Date(),
                interested: false
            });
        }
        
        return this.conversations.get(phoneNumber);
    }

    updateConversation(phoneNumber, message, response, intent) {
        const conversation = this.getConversation(phoneNumber);
        
        conversation.messageCount++;
        conversation.lastMessage = message;
        conversation.lastResponse = response;
        conversation.intent = intent;
        conversation.lastActivity = new Date();
        
        // Track interest level
        if (['booking', 'pricing', 'grillz', 'nails'].includes(intent)) {
            conversation.interested = true;
        }
        
        // Save conversation
        this.saveConversation(conversation);
    }

    saveConversation(conversation) {
        const conversationsFile = 'sms-conversations.json';
        let conversations = {};
        
        try {
            conversations = JSON.parse(fs.readFileSync(conversationsFile, 'utf8'));
        } catch (error) {
            conversations = {};
        }
        
        conversations[conversation.phoneNumber] = conversation;
        fs.writeFileSync(conversationsFile, JSON.stringify(conversations, null, 2));
    }

    // RESPONSE SENDING (Simulated - integrate with SMS service)
    sendResponse(phoneNumber, response) {
        console.log(`📤 Sending to ${phoneNumber}:`);
        console.log(response);
        console.log('─'.repeat(50));
        
        // In production, integrate with:
        // - Twilio SMS API
        // - TextMagic
        // - Or your phone's SMS forwarding
        
        // For now, log to file for manual sending
        this.logOutgoingMessage(phoneNumber, response);
    }

    logOutgoingMessage(phoneNumber, response) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            to: phoneNumber,
            message: response,
            type: 'outgoing'
        };
        
        fs.appendFileSync('sms-log.json', JSON.stringify(logEntry) + '\n');
    }

    // MONITORING & ANALYTICS
    getAnalytics() {
        const conversations = Array.from(this.conversations.values());
        
        return {
            totalConversations: conversations.length,
            interestedProspects: conversations.filter(c => c.interested).length,
            averageMessages: conversations.reduce((sum, c) => sum + c.messageCount, 0) / conversations.length,
            topIntents: this.getTopIntents(conversations),
            activeToday: conversations.filter(c => {
                const today = new Date().toDateString();
                return c.lastActivity && new Date(c.lastActivity).toDateString() === today;
            }).length
        };
    }

    getTopIntents(conversations) {
        const intents = {};
        conversations.forEach(c => {
            if (c.intent) {
                intents[c.intent] = (intents[c.intent] || 0) + 1;
            }
        });
        
        return Object.entries(intents)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
    }
    
    // AMBASSADOR LEAD TRACKING
    trackAmbassadorLead(phoneNumber, message) {
        const ambassadorLead = {
            phoneNumber,
            timestamp: new Date().toISOString(),
            message,
            status: 'application_sent',
            followUpDate: new Date(Date.now() + 86400000).toISOString() // 24 hours
        };
        
        // Save to ambassador leads file
        let ambassadorLeads = [];
        try {
            ambassadorLeads = JSON.parse(fs.readFileSync('ambassador-leads.json', 'utf8'));
        } catch (error) {
            ambassadorLeads = [];
        }
        
        ambassadorLeads.push(ambassadorLead);
        fs.writeFileSync('ambassador-leads.json', JSON.stringify(ambassadorLeads, null, 2));
        
        console.log(`✨ Ambassador lead tracked: ${phoneNumber}`);
    }

    // LISTENING SYSTEM (Simulated)
    startListening() {
        console.log('👂 SMS Chatbot listening for messages...');
        console.log('📱 Send test messages using: chatbot.processIncomingMessage("555-0123", "your message")');
        
        // Simulate some test messages
        setTimeout(() => this.runTests(), 5000);
    }

    runTests() {
        console.log('\n🧪 Running chatbot tests...\n');
        
        const testMessages = [
            { phone: '530-555-0001', message: 'Sprinkle Me' },
            { phone: '530-555-0002', message: 'How much for gold teeth?' },
            { phone: '530-555-0003', message: 'Where are you located?' },
            { phone: '530-555-0004', message: 'I need grillz for tomorrow' },
            { phone: '530-555-0005', message: 'What are your hours?' },
            { phone: '530-555-0006', message: 'Grill Girl' }
        ];
        
        testMessages.forEach((test, index) => {
            setTimeout(() => {
                this.processIncomingMessage(test.phone, test.message);
            }, index * 2000);
        });
        
        // Show analytics after tests
        setTimeout(() => {
            console.log('\n📊 CHATBOT ANALYTICS:');
            console.log(this.getAnalytics());
        }, 15000);
    }
}

// Initialize the chatbot
const smsChatbot = new SMSChatbot();

// Export for external use
module.exports = smsChatbot;

// Example usage:
// smsChatbot.processIncomingMessage('530-214-0676', 'Sprinkle Me');