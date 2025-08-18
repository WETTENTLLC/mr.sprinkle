// 🚀 HYBRID MCP SYSTEM - PRODUCTION READY
// Combines API automation + Browser automation + Manual fallback

require('dotenv').config();
const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');

class HybridMCPSystem {
    constructor() {
        this.isActive = false;
        this.browser = null;
        this.prospects = [];
        this.dailyStats = {
            prospects: 0,
            messages: 0,
            responses: 0,
            conversions: 0,
            revenue: 0
        };
        
        this.config = {
            instagram: {
                token: process.env.INSTAGRAM_ACCESS_TOKEN,
                hasAPI: !!process.env.INSTAGRAM_ACCESS_TOKEN
            },
            facebook: {
                token: process.env.FACEBOOK_ACCESS_TOKEN,
                pageId: process.env.FACEBOOK_PAGE_ID,
                hasAPI: !!process.env.FACEBOOK_ACCESS_TOKEN
            },
            twitter: {
                bearerToken: process.env.TWITTER_BEARER_TOKEN,
                hasAPI: !!process.env.TWITTER_BEARER_TOKEN
            },
            webhook: process.env.WEBHOOK_URL || null
        };
        
        this.rateLimits = {
            instagram: { sent: 0, limit: 100, resetTime: Date.now() + 86400000 },
            facebook: { sent: 0, limit: 50, resetTime: Date.now() + 86400000 },
            twitter: { sent: 0, limit: 300, resetTime: Date.now() + 86400000 }
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Hybrid MCP System...');
        
        // Initialize browser for automation fallback
        await this.initBrowser();
        
        // Load existing prospects
        this.loadProspects();
        
        // Start monitoring loop
        this.startMonitoring();
        
        console.log('✅ Hybrid MCP System Ready');
        this.logActivity('success', '🚀 Hybrid MCP System initialized and ready');
    }

    async initBrowser() {
        try {
            this.browser = await puppeteer.launch({
                headless: false, // Set to true for production
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            console.log('✅ Browser automation ready');
        } catch (error) {
            console.log('❌ Browser automation failed:', error.message);
            this.logActivity('error', `Browser init failed: ${error.message}`);
        }
    }

    // PROSPECT DISCOVERY ENGINE
    async findProspects() {
        console.log('🔍 Scanning for new prospects...');
        
        const newProspects = [];
        
        // Try API first, fallback to browser
        try {
            if (this.config.instagram.hasAPI) {
                const instagramProspects = await this.findInstagramProspectsAPI();
                newProspects.push(...instagramProspects);
            } else {
                const instagramProspects = await this.findInstagramProspectsBrowser();
                newProspects.push(...instagramProspects);
            }
        } catch (error) {
            console.log('Instagram scan failed:', error.message);
        }

        try {
            if (this.config.facebook.hasAPI) {
                const facebookProspects = await this.findFacebookProspectsAPI();
                newProspects.push(...facebookProspects);
            } else {
                const facebookProspects = await this.findFacebookProspectsBrowser();
                newProspects.push(...facebookProspects);
            }
        } catch (error) {
            console.log('Facebook scan failed:', error.message);
        }

        try {
            if (this.config.twitter.hasAPI) {
                const twitterProspects = await this.findTwitterProspectsAPI();
                newProspects.push(...twitterProspects);
            } else {
                const twitterProspects = await this.findTwitterProspectsBrowser();
                newProspects.push(...twitterProspects);
            }
        } catch (error) {
            console.log('Twitter scan failed:', error.message);
        }

        // Add new prospects to queue
        const qualifiedProspects = newProspects.filter(p => this.isQualifiedProspect(p));
        this.prospects.push(...qualifiedProspects);
        
        this.logActivity('success', `🎯 Found ${qualifiedProspects.length} new qualified prospects`);
        this.saveProspects();
        
        return qualifiedProspects;
    }

    // INSTAGRAM API INTEGRATION
    async findInstagramProspectsAPI() {
        const prospects = [];
        const hashtags = ['grillz', 'goldteeth', 'customjewelry', 'renomusic'];
        
        for (const hashtag of hashtags) {
            try {
                const response = await axios.get(`https://graph.instagram.com/ig_hashtag_search`, {
                    params: {
                        user_id: this.config.instagram.userId,
                        q: hashtag,
                        access_token: this.config.instagram.token
                    }
                });
                
                if (response.data.data) {
                    response.data.data.forEach(post => {
                        if (this.isRenoArea(post.location)) {
                            prospects.push({
                                platform: 'instagram',
                                id: post.id,
                                username: post.username,
                                content: post.caption,
                                location: post.location,
                                engagement: post.like_count + post.comment_count,
                                priority: this.calculatePriority(post),
                                method: 'api'
                            });
                        }
                    });
                }
            } catch (error) {
                console.log(`Instagram API error for #${hashtag}:`, error.message);
            }
        }
        
        return prospects;
    }

    // INSTAGRAM BROWSER AUTOMATION
    async findInstagramProspectsBrowser() {
        if (!this.browser) return [];
        
        const prospects = [];
        const hashtags = ['grillz', 'goldteeth', 'renomusic'];
        
        try {
            const page = await this.browser.newPage();
            await page.goto('https://instagram.com/accounts/login/');
            
            // Login (you'll need to handle this)
            await this.loginInstagram(page);
            
            for (const hashtag of hashtags) {
                await page.goto(`https://instagram.com/explore/tags/${hashtag}/`);
                await page.waitForSelector('article a', { timeout: 10000 });
                
                const posts = await page.$$eval('article a', links => 
                    links.slice(0, 20).map(link => ({
                        url: link.href,
                        image: link.querySelector('img')?.src
                    }))
                );
                
                for (const post of posts) {
                    await page.goto(post.url);
                    await page.waitForSelector('article', { timeout: 5000 });
                    
                    const postData = await page.evaluate(() => {
                        const username = document.querySelector('article header a')?.textContent;
                        const caption = document.querySelector('article div[data-testid="post-caption"]')?.textContent;
                        const location = document.querySelector('article header div[title]')?.textContent;
                        const likes = document.querySelector('article section button span')?.textContent;
                        
                        return { username, caption, location, likes };
                    });
                    
                    if (this.isRenoArea(postData.location)) {
                        prospects.push({
                            platform: 'instagram',
                            username: postData.username,
                            content: postData.caption,
                            location: postData.location,
                            engagement: this.parseLikes(postData.likes),
                            priority: this.calculatePriority(postData),
                            method: 'browser',
                            url: post.url
                        });
                    }
                }
            }
            
            await page.close();
        } catch (error) {
            console.log('Instagram browser automation error:', error.message);
        }
        
        return prospects;
    }

    // MESSAGE SENDING ENGINE
    async sendMessage(prospect) {
        if (!this.canSendMessage(prospect.platform)) {
            this.logActivity('warning', `Rate limit reached for ${prospect.platform}`);
            return false;
        }
        
        const message = this.generatePersonalizedMessage(prospect);
        let success = false;
        
        try {
            // Try API first
            if (prospect.method === 'api' && this.config[prospect.platform].hasAPI) {
                success = await this.sendMessageAPI(prospect, message);
            } else {
                // Fallback to browser automation
                success = await this.sendMessageBrowser(prospect, message);
            }
            
            if (success) {
                this.rateLimits[prospect.platform].sent++;
                this.dailyStats.messages++;
                this.logActivity('success', `📱 Message sent to @${prospect.username} on ${prospect.platform}`);
                
                // Track in webhook
                await this.trackOutreach(prospect, message);
            }
            
        } catch (error) {
            this.logActivity('error', `Failed to message @${prospect.username}: ${error.message}`);
        }
        
        return success;
    }

    async sendMessageAPI(prospect, message) {
        switch (prospect.platform) {
            case 'instagram':
                return await this.sendInstagramDMAPI(prospect, message);
            case 'facebook':
                return await this.sendFacebookMessageAPI(prospect, message);
            case 'twitter':
                return await this.sendTwitterDMAPI(prospect, message);
            default:
                return false;
        }
    }

    async sendInstagramDMAPI(prospect, message) {
        try {
            const response = await axios.post('https://graph.instagram.com/me/messages', {
                recipient: { id: prospect.id },
                message: { text: message }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.config.instagram.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.status === 200;
        } catch (error) {
            throw new Error(`Instagram API error: ${error.message}`);
        }
    }

    // BROWSER AUTOMATION MESSAGE SENDING
    async sendMessageBrowser(prospect, message) {
        if (!this.browser) return false;
        
        try {
            const page = await this.browser.newPage();
            
            switch (prospect.platform) {
                case 'instagram':
                    return await this.sendInstagramDMBrowser(page, prospect, message);
                case 'facebook':
                    return await this.sendFacebookMessageBrowser(page, prospect, message);
                case 'twitter':
                    return await this.sendTwitterDMBrowser(page, prospect, message);
                default:
                    await page.close();
                    return false;
            }
        } catch (error) {
            throw new Error(`Browser automation error: ${error.message}`);
        }
    }

    async sendInstagramDMBrowser(page, prospect, message) {
        try {
            // Navigate to user profile
            await page.goto(`https://instagram.com/${prospect.username}/`);
            await page.waitForSelector('button', { timeout: 10000 });
            
            // Click Message button
            const messageButton = await page.$x("//button[contains(text(), 'Message')]");
            if (messageButton.length > 0) {
                await messageButton[0].click();
                await page.waitForSelector('textarea', { timeout: 5000 });
                
                // Type and send message
                await page.type('textarea', message);
                await page.keyboard.press('Enter');
                
                await page.close();
                return true;
            }
            
            await page.close();
            return false;
        } catch (error) {
            await page.close();
            throw error;
        }
    }

    // RESPONSE MONITORING
    async checkResponses() {
        console.log('📬 Checking for responses...');
        
        const responses = [];
        
        // Check each platform for responses
        if (this.config.instagram.hasAPI) {
            const instagramResponses = await this.checkInstagramResponsesAPI();
            responses.push(...instagramResponses);
        }
        
        if (this.config.facebook.hasAPI) {
            const facebookResponses = await this.checkFacebookResponsesAPI();
            responses.push(...facebookResponses);
        }
        
        if (this.config.twitter.hasAPI) {
            const twitterResponses = await this.checkTwitterResponsesAPI();
            responses.push(...twitterResponses);
        }
        
        // Process responses
        for (const response of responses) {
            await this.processResponse(response);
        }
        
        return responses;
    }

    async processResponse(response) {
        const sentiment = this.analyzeSentiment(response.message);
        
        if (sentiment === 'interested') {
            await this.sendBookingFlow(response);
            this.dailyStats.conversions++;
        } else if (sentiment === 'questions') {
            await this.sendInfoPacket(response);
        }
        
        this.dailyStats.responses++;
        this.logActivity('success', `💬 Response processed from @${response.username}: ${sentiment}`);
    }

    async sendBookingFlow(response) {
        const bookingMessage = `🎉 Awesome! Ready for your custom grillz?

📱 Text "Sprinkle Me" to (530) 214-0676
🌐 Visit: mrsprinklereno.com
📧 Email: info@mrsprinklereno.com

🕰️ TURNAROUND: 2-4 days gold, 4-10 days gems
🚗 MOBILE SERVICE: Available throughout Reno area
📱 CUSTOM QUOTES: Text your vision for instant pricing

Mold Monday appointments or mobile service available! 💎`;

        await this.sendMessage({
            ...response,
            customMessage: bookingMessage
        });
    }

    // UTILITY FUNCTIONS
    generatePersonalizedMessage(prospect) {
        const templates = [
            `🔥 Saw your ${prospect.platform} content! You'd look incredible with custom gold grillz. Mr. Sprinkle in Reno - 0% tarnish guarantee, medical-grade dental gold. Text "Sprinkle Me" to (530) 214-0676 for FREE consultation!`,
            
            `💎 Your style is fire! As Reno's grillz expert since 2002, we create battle-born gold teeth that never tarnish. Safe for eating/drinking/smoking! Text "Sprinkle Me" to (530) 214-0676`,
            
            `🎵 Love your vibe! Custom gold grillz - medical-grade dental gold, VS+ diamonds available. Mr. Sprinkle Reno - your smile, battle-born and Reno-tough! Text "Sprinkle Me" to (530) 214-0676`
        ];
        
        return templates[Math.floor(Math.random() * templates.length)];
    }

    isRenoArea(location) {
        if (!location) return false;
        const renoKeywords = ['reno', 'sparks', 'carson city', 'lake tahoe', 'nevada', 'nv'];
        return renoKeywords.some(keyword => 
            location.toLowerCase().includes(keyword)
        );
    }

    isQualifiedProspect(prospect) {
        const qualifiers = ['music', 'fashion', 'style', 'jewelry', 'gold', 'bling', 'custom'];
        const content = (prospect.content || '').toLowerCase();
        return qualifiers.some(qualifier => content.includes(qualifier));
    }

    calculatePriority(prospect) {
        let priority = 5;
        
        if (prospect.engagement > 100) priority += 3;
        else if (prospect.engagement > 50) priority += 2;
        else if (prospect.engagement > 10) priority += 1;
        
        const content = (prospect.content || '').toLowerCase();
        if (content.includes('grillz') || content.includes('gold teeth')) priority += 3;
        if (content.includes('custom') || content.includes('jewelry')) priority += 2;
        if (this.isRenoArea(prospect.location)) priority += 2;
        
        return Math.min(priority, 10);
    }

    canSendMessage(platform) {
        const limit = this.rateLimits[platform];
        if (Date.now() > limit.resetTime) {
            limit.sent = 0;
            limit.resetTime = Date.now() + 86400000; // Reset daily
        }
        return limit.sent < limit.limit;
    }

    analyzeSentiment(message) {
        const interested = ['yes', 'interested', 'tell me more', 'price', 'cost', 'how much', 'book', 'appointment'];
        const questions = ['what', 'how', 'when', 'where', 'info', 'details'];
        
        const text = message.toLowerCase();
        
        if (interested.some(word => text.includes(word))) return 'interested';
        if (questions.some(word => text.includes(word))) return 'questions';
        return 'neutral';
    }

    // DATA MANAGEMENT
    saveProspects() {
        fs.writeFileSync('prospects.json', JSON.stringify(this.prospects, null, 2));
    }

    loadProspects() {
        try {
            const data = fs.readFileSync('prospects.json', 'utf8');
            this.prospects = JSON.parse(data);
        } catch (error) {
            this.prospects = [];
        }
    }

    async trackOutreach(prospect, message) {
        if (this.config.webhook) {
            try {
                await axios.post(this.config.webhook, {
                    type: 'outreach',
                    platform: prospect.platform,
                    username: prospect.username,
                    message: message,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.log('Webhook error:', error.message);
            }
        }
    }

    logActivity(type, message) {
        const timestamp = new Date().toLocaleString();
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
        
        // Could also write to file or send to dashboard
        const logEntry = { timestamp, type, message };
        
        // Append to log file
        fs.appendFileSync('mcp-activity.log', JSON.stringify(logEntry) + '\n');
    }

    // MAIN MONITORING LOOP
    startMonitoring() {
        console.log('🔄 Starting monitoring loop...');
        
        // Find prospects every hour
        setInterval(async () => {
            if (this.isActive) {
                await this.findProspects();
            }
        }, 3600000); // 1 hour

        // Send messages every 2 minutes
        setInterval(async () => {
            if (this.isActive && this.prospects.length > 0) {
                const prospect = this.prospects.shift(); // Get next prospect
                await this.sendMessage(prospect);
                await this.delay(30000); // 30 second delay
            }
        }, 120000); // 2 minutes

        // Check responses every 5 minutes
        setInterval(async () => {
            if (this.isActive) {
                await this.checkResponses();
            }
        }, 300000); // 5 minutes
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // CONTROL METHODS
    activate() {
        this.isActive = true;
        console.log('🚀 MCP System ACTIVATED');
        this.logActivity('success', 'MCP System activated - hunting mode ON');
    }

    deactivate() {
        this.isActive = false;
        console.log('⏸️ MCP System PAUSED');
        this.logActivity('warning', 'MCP System paused - hunting mode OFF');
    }

    async shutdown() {
        this.isActive = false;
        if (this.browser) {
            await this.browser.close();
        }
        console.log('🛑 MCP System SHUTDOWN');
        this.logActivity('error', 'MCP System shutdown');
    }
}

// Initialize and start the system
const hybridMCP = new HybridMCPSystem();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down MCP System...');
    await hybridMCP.shutdown();
    process.exit(0);
});

// Export for external control
module.exports = hybridMCP;