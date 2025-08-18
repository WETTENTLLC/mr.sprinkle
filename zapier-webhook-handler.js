// 📱 ZAPIER SMS WEBHOOK HANDLER
// Processes incoming SMS and returns automated responses

const express = require('express');
const app = express();
app.use(express.json());

// SMS Processing Function
function processIncomingSMS(phoneNumber, messageBody) {
    const message = messageBody.toLowerCase().trim();
    
    // Log incoming message
    console.log(`📱 SMS from ${phoneNumber}: ${messageBody}`);
    
    // Keyword Detection & Responses
    if (message.includes('sprinkle me')) {
        return {
            response: `🔥 Welcome to Mr. Sprinkle!\n\nReady for custom grillz?\n\n📋 NEXT STEPS:\n• Visit: mrsprinklereno.com\n• View gallery & book consultation\n• Text your grillz vision for quote\n\n💎 Medical-grade dental gold • 0% tarnish guarantee`,
            priority: 'high',
            type: 'booking'
        };
    }
    
    if (message.includes('grill girl') || message.includes('grillgirl')) {
        return {
            response: `✨ GRILL GIRL AMBASSADOR PROGRAM\n"Reno's Shiniest Collab"\n\n🎯 BENEFITS:\n• 50% OFF your dream grillz\n• FREE Lake Tahoe photoshoot\n• Earn 20% commission on referrals\n\n📋 APPLY NOW:\n[AMBASSADOR_FORM_LINK]\n\nWe'll respond within 24 hours! 💎`,
            priority: 'high',
            type: 'ambassador'
        };
    }
    
    if (message.includes('pricing') || message.includes('price') || message.includes('cost')) {
        return {
            response: `💰 CUSTOM GRILLZ PRICING\n\n🎯 PERSONALIZED QUOTES ONLY:\nEvery piece is custom-made!\n\n📱 TEXT FOR INSTANT QUOTE:\n"I want [X] teeth in [gold type]"\nExample: "4 front teeth in 18K gold"\n\n💎 WHAT WE GUARANTEE:\n• Medical-grade dental gold\n• 0% tarnish guarantee\n• Perfect custom fit\n• 20+ years experience`,
            priority: 'medium',
            type: 'pricing'
        };
    }
    
    if (message.includes('location') || message.includes('where')) {
        return {
            response: `📍 FIND MR. SPRINKLE\n\n🏢 MOLD MONDAYS:\nWeekly events at partner locations\nBarbershops, tattoo parlors & more\n\n🚗 MOBILE SERVICE:\nWe come to YOU anywhere in Reno area\n\n📱 CURRENT LOCATIONS:\nText for this week's Mold Monday spots\nCheck Instagram @mr.sprinkle_reno`,
            priority: 'medium',
            type: 'location'
        };
    }
    
    if (message.includes('help') || message.includes('menu') || message.includes('options')) {
        return {
            response: `❓ MR. SPRINKLE HELP MENU\n\n📱 QUICK COMMANDS:\n• "SPRINKLE ME" - Start booking\n• "GRILL GIRL" - Ambassador program\n• "PRICING" - Get quotes\n• "LOCATION" - Find us\n\n💬 OR JUST TEXT:\nDescribe your grillz vision and we'll create a custom quote!\n\nExample: "I want gold fangs with diamonds"`,
            priority: 'low',
            type: 'help'
        };
    }
    
    // Check for custom grillz descriptions
    if (message.includes('want') || message.includes('need') || message.includes('teeth') || message.includes('gold')) {
        return {
            response: `🎨 CUSTOM GRILLZ QUOTE REQUEST\n\nReceived your vision: "${messageBody}"\n\n📋 FOR ACCURATE QUOTE, PLEASE SPECIFY:\n• How many teeth?\n• Gold type (14K, 18K)?\n• Diamonds/gems wanted?\n• Any special designs?\n\n💬 Reply with details and we'll send exact pricing within 1 hour!`,
            priority: 'high',
            type: 'custom_quote'
        };
    }
    
    // Default response for unclear messages
    return {
        response: `💬 Thanks for texting Mr. Sprinkle!\n\n🔥 QUICK START:\n• Text "SPRINKLE ME" to begin\n• Text "GRILL GIRL" for ambassador program\n• Describe your grillz vision for quotes\n\n📞 Need immediate help?\nEmail: info@mrsprinklereno.com\nInstagram: @mr.sprinkle_reno`,
        priority: 'low',
        type: 'default'
    };
}

// Zapier Webhook Endpoint
app.post('/zapier-sms-webhook', (req, res) => {
    try {
        const { from, body, timestamp } = req.body;
        
        // Process the SMS
        const result = processIncomingSMS(from, body);
        
        // Log for analytics
        console.log(`📊 Response type: ${result.type}, Priority: ${result.priority}`);
        
        // Return response for Zapier to send
        res.json({
            success: true,
            response_message: result.response,
            send_to: from,
            priority: result.priority,
            message_type: result.type,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(500).json({
            success: false,
            error: 'Processing failed',
            fallback_message: 'Thanks for texting Mr. Sprinkle! We received your message and will respond shortly. Visit mrsprinklereno.com for immediate assistance.'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'SMS webhook active', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 SMS Webhook server running on port ${PORT}`);
    console.log(`📱 Ready to process SMS from (530) 214-0676`);
});

module.exports = { processIncomingSMS };