// 🚀 NO-API AUTOMATION SYSTEM
// Pure browser automation - no API calls needed

const puppeteer = require('puppeteer');
const fs = require('fs');

class NoAPIAutomation {
    constructor() {
        this.browser = null;
        this.isActive = false;
        this.prospects = [];
        this.dailyStats = {
            prospects: 0,
            messages: 0,
            responses: 0
        };
        
        this.credentials = {
            instagram: { username: '', password: '' },
            facebook: { username: '', password: '' },
            twitter: { username: '', password: '' }
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Starting NO-API Automation System...');
        await this.initBrowser();
        this.startHuntingLoop();
        console.log('✅ NO-API System Ready - Pure Browser Automation');
    }

    async initBrowser() {
        this.browser = await puppeteer.launch({
            headless: false, // Keep visible to see what's happening
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            ]
        });
        console.log('✅ Browser launched - Ready for automation');
    }

    // INSTAGRAM AUTOMATION (NO API)
    async huntInstagramProspects() {
        console.log('🔍 Hunting Instagram prospects...');
        
        const page = await this.browser.newPage();
        
        try {
            // Go to Instagram
            await page.goto('https://instagram.com', { waitUntil: 'networkidle2' });
            
            // Login if needed (you'll need to do this once manually)
            const isLoggedIn = await this.checkInstagramLogin(page);
            if (!isLoggedIn) {
                console.log('⚠️ Please login to Instagram manually in the browser');
                await this.waitForManualLogin(page);
            }
            
            // Search hashtags
            const hashtags = ['grillz', 'goldteeth', 'renomusic', 'customjewelry'];
            
            for (const hashtag of hashtags) {
                await page.goto(`https://instagram.com/explore/tags/${hashtag}/`);
                await page.waitForSelector('article', { timeout: 10000 });
                
                // Get recent posts
                const posts = await page.$$eval('article a', links => 
                    links.slice(0, 12).map(link => link.href)
                );
                
                // Check each post for Reno users
                for (const postUrl of posts) {
                    const prospect = await this.analyzeInstagramPost(page, postUrl);
                    if (prospect && this.isRenoProspect(prospect)) {
                        this.prospects.push(prospect);
                        console.log(`✅ Found prospect: @${prospect.username}`);
                    }
                    
                    await this.randomDelay(2000, 5000); // Human-like delays
                }
            }
            
        } catch (error) {
            console.log('Instagram error:', error.message);
        } finally {
            await page.close();
        }
    }

    async analyzeInstagramPost(page, postUrl) {
        try {
            await page.goto(postUrl);
            await page.waitForSelector('article', { timeout: 5000 });
            
            const postData = await page.evaluate(() => {
                const username = document.querySelector('article header a')?.textContent;
                const caption = document.querySelector('article div[data-testid="post-caption"]')?.textContent;
                const location = document.querySelector('article header div[title]')?.textContent;
                const profileLink = document.querySelector('article header a')?.href;
                
                return { username, caption, location, profileLink };
            });
            
            return {
                platform: 'instagram',
                username: postData.username,
                content: postData.caption,
                location: postData.location,
                profileUrl: postData.profileLink,
                postUrl: postUrl,
                priority: this.calculatePriority(postData)
            };
            
        } catch (error) {
            return null;
        }
    }

    async sendInstagramDM(prospect, message) {
        const page = await this.browser.newPage();
        
        try {
            // Go to profile
            await page.goto(prospect.profileUrl);
            await page.waitForSelector('button', { timeout: 10000 });
            
            // Find and click Message button
            const messageButton = await page.$x("//button[contains(text(), 'Message')]");
            if (messageButton.length > 0) {
                await messageButton[0].click();
                await page.waitForSelector('textarea', { timeout: 5000 });
                
                // Type message with human-like typing
                await this.humanTypeMessage(page, 'textarea', message);
                
                // Send message
                await page.keyboard.press('Enter');
                
                console.log(`📱 DM sent to @${prospect.username}`);
                this.dailyStats.messages++;
                
                return true;
            }
            
        } catch (error) {
            console.log(`Failed to DM @${prospect.username}:`, error.message);
        } finally {
            await page.close();
        }
        
        return false;
    }

    // FACEBOOK AUTOMATION (NO API)
    async huntFacebookProspects() {
        console.log('🔍 Hunting Facebook prospects...');
        
        const page = await this.browser.newPage();
        
        try {
            await page.goto('https://facebook.com', { waitUntil: 'networkidle2' });
            
            // Check login
            const isLoggedIn = await this.checkFacebookLogin(page);
            if (!isLoggedIn) {
                console.log('⚠️ Please login to Facebook manually');
                await this.waitForManualLogin(page);
            }
            
            // Search groups
            const groups = [
                'Reno Nevada Buy Sell Trade',
                'Reno Small Business Network',
                'Nevada Hip Hop Scene'
            ];
            
            for (const group of groups) {
                await this.searchFacebookGroup(page, group);
            }
            
        } catch (error) {
            console.log('Facebook error:', error.message);
        } finally {
            await page.close();
        }
    }

    async searchFacebookGroup(page, groupName) {
        try {
            // Search for group
            await page.goto(`https://facebook.com/search/groups/?q=${encodeURIComponent(groupName)}`);
            await page.waitForSelector('[role="main"]', { timeout: 10000 });
            
            // Click first group result
            const groupLink = await page.$('a[href*="/groups/"]');
            if (groupLink) {
                await groupLink.click();
                await page.waitForSelector('[role="main"]', { timeout: 10000 });
                
                // Scan recent posts
                await this.scanGroupPosts(page, groupName);
            }
            
        } catch (error) {
            console.log(`Error scanning group ${groupName}:`, error.message);
        }
    }

    async scanGroupPosts(page, groupName) {
        try {
            // Scroll to load posts
            await page.evaluate(() => window.scrollTo(0, 1000));
            await this.randomDelay(2000, 4000);
            
            // Find posts about jewelry/fashion
            const posts = await page.$$eval('[data-pagelet="FeedUnit"]', elements => 
                elements.slice(0, 10).map(post => ({
                    text: post.textContent,
                    author: post.querySelector('strong')?.textContent,
                    link: post.querySelector('a[href*="/groups/"]')?.href
                }))
            );
            
            for (const post of posts) {
                if (this.isJewelryRelated(post.text)) {
                    this.prospects.push({
                        platform: 'facebook',
                        username: post.author,
                        content: post.text,
                        group: groupName,
                        priority: this.calculatePriority(post)
                    });
                    
                    console.log(`✅ Found Facebook prospect: ${post.author} in ${groupName}`);
                }
            }
            
        } catch (error) {
            console.log('Error scanning posts:', error.message);
        }
    }

    // TWITTER AUTOMATION (NO API)
    async huntTwitterProspects() {
        console.log('🔍 Hunting Twitter prospects...');
        
        const page = await this.browser.newPage();
        
        try {
            await page.goto('https://twitter.com', { waitUntil: 'networkidle2' });
            
            // Check login
            const isLoggedIn = await this.checkTwitterLogin(page);
            if (!isLoggedIn) {
                console.log('⚠️ Please login to Twitter manually');
                await this.waitForManualLogin(page);
            }
            
            // Search keywords
            const keywords = ['grillz reno', 'gold teeth nevada', 'custom jewelry sparks'];
            
            for (const keyword of keywords) {
                await this.searchTwitterKeyword(page, keyword);
            }
            
        } catch (error) {
            console.log('Twitter error:', error.message);
        } finally {
            await page.close();
        }
    }

    async searchTwitterKeyword(page, keyword) {
        try {
            await page.goto(`https://twitter.com/search?q=${encodeURIComponent(keyword)}&src=typed_query&f=live`);
            await page.waitForSelector('[data-testid="tweet"]', { timeout: 10000 });
            
            // Get recent tweets
            const tweets = await page.$$eval('[data-testid="tweet"]', elements =>
                elements.slice(0, 10).map(tweet => ({
                    text: tweet.textContent,
                    author: tweet.querySelector('[data-testid="User-Name"]')?.textContent,
                    link: tweet.querySelector('a[href*="/status/"]')?.href
                }))
            );
            
            for (const tweet of tweets) {
                if (this.isRenoRelated(tweet.text)) {
                    this.prospects.push({
                        platform: 'twitter',
                        username: tweet.author,
                        content: tweet.text,
                        tweetUrl: tweet.link,
                        priority: this.calculatePriority(tweet)
                    });
                    
                    console.log(`✅ Found Twitter prospect: ${tweet.author}`);
                }
            }
            
        } catch (error) {
            console.log(`Error searching ${keyword}:`, error.message);
        }
    }

    // AUTOMATED MESSAGING
    async startMessaging() {
        if (this.prospects.length === 0) {
            console.log('⚠️ No prospects found. Running prospect hunt first...');
            await this.huntAllPlatforms();
        }
        
        // Sort by priority
        this.prospects.sort((a, b) => b.priority - a.priority);
        
        // Send messages to top prospects
        const topProspects = this.prospects.slice(0, 20);
        
        for (const prospect of topProspects) {
            const message = this.generatePersonalizedMessage(prospect);
            
            try {
                switch (prospect.platform) {
                    case 'instagram':
                        await this.sendInstagramDM(prospect, message);
                        break;
                    case 'facebook':
                        await this.sendFacebookMessage(prospect, message);
                        break;
                    case 'twitter':
                        await this.sendTwitterDM(prospect, message);
                        break;
                }
                
                // Human-like delay between messages
                await this.randomDelay(30000, 60000); // 30-60 seconds
                
            } catch (error) {
                console.log(`Error messaging ${prospect.username}:`, error.message);
            }
        }
    }

    async huntAllPlatforms() {
        console.log('🎯 Starting full platform hunt...');
        
        await this.huntInstagramProspects();
        await this.huntFacebookProspects();
        await this.huntTwitterProspects();
        
        console.log(`🎉 Hunt complete! Found ${this.prospects.length} total prospects`);
        this.saveProspects();
    }

    // UTILITY FUNCTIONS
    generatePersonalizedMessage(prospect) {
        const templates = [
            `🔥 Saw your ${prospect.platform} post! You'd look incredible with custom gold grillz. Mr. Sprinkle in Reno creates medical-grade pieces that never tarnish. Text "Sprinkle Me" to (530) 214-0676 for FREE consultation!`,
            
            `💎 Your style is fire! As Reno's #1 grillz expert since 2002, Mr. Sprinkle can create custom gold teeth that match your energy. Medical-grade guarantee - no tarnish ever! Check: mrsprinklereno.com`,
            
            `🎵 Love your content! Custom gold grillz would complete your look perfectly. Mr. Sprinkle - 20+ years experience, medical-grade dental gold. FREE consultation in Reno! Text "Sprinkle Me" to (530) 214-0676`
        ];
        
        return templates[Math.floor(Math.random() * templates.length)];
    }

    async humanTypeMessage(page, selector, message) {
        await page.click(selector);
        
        // Type with human-like delays
        for (const char of message) {
            await page.keyboard.type(char);
            await this.randomDelay(50, 150); // Random typing speed
        }
    }

    async randomDelay(min, max) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    isRenoProspect(prospect) {
        const renoKeywords = ['reno', 'sparks', 'carson city', 'lake tahoe', 'nevada', 'nv'];
        const location = (prospect.location || '').toLowerCase();
        const content = (prospect.content || '').toLowerCase();
        
        return renoKeywords.some(keyword => 
            location.includes(keyword) || content.includes(keyword)
        );
    }

    isJewelryRelated(text) {
        const keywords = ['jewelry', 'grillz', 'gold', 'custom', 'bling', 'teeth', 'fashion'];
        return keywords.some(keyword => text.toLowerCase().includes(keyword));
    }

    isRenoRelated(text) {
        const keywords = ['reno', 'sparks', 'nevada', 'lake tahoe', 'carson city'];
        return keywords.some(keyword => text.toLowerCase().includes(keyword));
    }

    calculatePriority(prospect) {
        let priority = 5;
        
        const content = (prospect.content || prospect.text || '').toLowerCase();
        
        if (content.includes('grillz') || content.includes('gold teeth')) priority += 3;
        if (content.includes('custom') || content.includes('jewelry')) priority += 2;
        if (content.includes('reno') || content.includes('nevada')) priority += 2;
        if (content.includes('music') || content.includes('fashion')) priority += 1;
        
        return Math.min(priority, 10);
    }

    async checkInstagramLogin(page) {
        try {
            await page.waitForSelector('nav', { timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async checkFacebookLogin(page) {
        try {
            await page.waitForSelector('[role="navigation"]', { timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async checkTwitterLogin(page) {
        try {
            await page.waitForSelector('[data-testid="SideNav_AccountSwitcher_Button"]', { timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async waitForManualLogin(page) {
        console.log('⏳ Waiting for manual login... Press Enter when done.');
        
        // Wait for user input
        await new Promise(resolve => {
            process.stdin.once('data', () => resolve());
        });
    }

    saveProspects() {
        fs.writeFileSync('no-api-prospects.json', JSON.stringify(this.prospects, null, 2));
        console.log(`💾 Saved ${this.prospects.length} prospects to file`);
    }

    loadProspects() {
        try {
            const data = fs.readFileSync('no-api-prospects.json', 'utf8');
            this.prospects = JSON.parse(data);
            console.log(`📂 Loaded ${this.prospects.length} existing prospects`);
        } catch {
            this.prospects = [];
        }
    }

    // MAIN AUTOMATION LOOP
    startHuntingLoop() {
        console.log('🔄 Starting automated hunting loop...');
        
        // Hunt for prospects every 2 hours
        setInterval(async () => {
            if (this.isActive) {
                console.log('🎯 Starting scheduled prospect hunt...');
                await this.huntAllPlatforms();
            }
        }, 7200000); // 2 hours
        
        // Send messages every 30 minutes
        setInterval(async () => {
            if (this.isActive && this.prospects.length > 0) {
                console.log('📱 Starting scheduled messaging...');
                await this.startMessaging();
            }
        }, 1800000); // 30 minutes
    }

    // CONTROL METHODS
    activate() {
        this.isActive = true;
        console.log('🚀 NO-API Automation ACTIVATED');
        
        // Start immediate hunt
        setTimeout(() => this.huntAllPlatforms(), 5000);
    }

    deactivate() {
        this.isActive = false;
        console.log('⏸️ NO-API Automation PAUSED');
    }

    async shutdown() {
        this.isActive = false;
        if (this.browser) {
            await this.browser.close();
        }
        console.log('🛑 NO-API Automation SHUTDOWN');
    }
}

// Start the system
const noAPISystem = new NoAPIAutomation();

// Activate after 10 seconds
setTimeout(() => {
    noAPISystem.activate();
}, 10000);

// Handle shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await noAPISystem.shutdown();
    process.exit(0);
});

module.exports = noAPISystem;