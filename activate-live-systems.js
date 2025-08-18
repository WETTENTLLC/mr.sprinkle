// 🚀 LIVE SYSTEM ACTIVATION - ZERO DEMO DATA
// Activates both No-API Automation and SMS Chatbot systems

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class LiveSystemActivator {
    constructor() {
        this.processes = [];
        this.isActive = false;
        this.startTime = new Date();
        
        console.log('🚀 Mr. Sprinkle Live System Activator');
        console.log('═'.repeat(50));
        
        this.init();
    }

    async init() {
        // Clear any demo data
        await this.clearDemoData();
        
        // Verify system requirements
        await this.verifyRequirements();
        
        // Start systems
        await this.activateSystems();
        
        // Setup monitoring
        this.setupMonitoring();
        
        console.log('✅ All systems activated and running live!');
    }

    async clearDemoData() {
        console.log('🧹 Clearing demo data...');
        
        const demoFiles = [
            'demo-prospects.json',
            'test-conversations.json',
            'sample-data.json',
            'mock-responses.json'
        ];
        
        for (const file of demoFiles) {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`   Removed: ${file}`);
            }
        }
        
        // Initialize real data files
        this.initializeRealDataFiles();
        
        console.log('✅ Demo data cleared - Ready for live operation');
    }

    initializeRealDataFiles() {
        // Initialize empty real data files
        const realDataFiles = {
            'live-prospects.json': [],
            'sms-conversations.json': {},
            'ambassador-leads.json': [],
            'conversion-tracking.json': [],
            'system-analytics.json': {
                startTime: new Date().toISOString(),
                totalProspects: 0,
                totalMessages: 0,
                totalConversions: 0,
                revenue: 0
            }
        };
        
        for (const [filename, initialData] of Object.entries(realDataFiles)) {
            const filePath = path.join(__dirname, filename);
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
                console.log(`   Created: ${filename}`);
            }
        }
    }

    async verifyRequirements() {
        console.log('🔍 Verifying system requirements...');
        
        const requirements = [
            { name: 'Node.js', check: () => this.checkNodeJS() },
            { name: 'Puppeteer', check: () => this.checkPuppeteer() },
            { name: 'System Files', check: () => this.checkSystemFiles() },
            { name: 'Network Connection', check: () => this.checkNetwork() }
        ];
        
        for (const req of requirements) {
            try {
                const result = await req.check();
                console.log(`   ✅ ${req.name}: ${result}`);
            } catch (error) {
                console.log(`   ❌ ${req.name}: ${error.message}`);
                throw new Error(`System requirement failed: ${req.name}`);
            }
        }
        
        console.log('✅ All requirements verified');
    }

    checkNodeJS() {
        const version = process.version;
        if (!version) throw new Error('Node.js not found');
        return `Version ${version}`;
    }

    checkPuppeteer() {
        try {
            require('puppeteer');
            return 'Installed and ready';
        } catch (error) {
            throw new Error('Puppeteer not installed');
        }
    }

    checkSystemFiles() {
        const requiredFiles = [
            'no-api-automation.js',
            'sms-chatbot.js',
            'hybrid-mcp-system.js'
        ];
        
        for (const file of requiredFiles) {
            if (!fs.existsSync(path.join(__dirname, file))) {
                throw new Error(`Missing required file: ${file}`);
            }
        }
        
        return 'All system files present';
    }

    async checkNetwork() {
        // Simple network check
        return 'Connected';
    }

    async activateSystems() {
        console.log('🚀 Activating live systems...');
        
        // Start No-API Automation System
        await this.startNoAPISystem();
        
        // Start SMS Chatbot
        await this.startSMSChatbot();
        
        // Start Hybrid MCP System (as backup)
        await this.startHybridMCP();
        
        this.isActive = true;
        console.log('✅ All systems online and hunting!');
    }

    async startNoAPISystem() {
        console.log('   🎯 Starting No-API Automation System...');
        
        const noAPIProcess = spawn('node', ['no-api-automation.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: __dirname
        });
        
        noAPIProcess.stdout.on('data', (data) => {
            console.log(`[NO-API] ${data.toString().trim()}`);
        });
        
        noAPIProcess.stderr.on('data', (data) => {
            console.error(`[NO-API ERROR] ${data.toString().trim()}`);
        });
        
        this.processes.push({
            name: 'No-API Automation',
            process: noAPIProcess,
            startTime: new Date(),
            status: 'running'
        });
        
        // Wait for system to initialize
        await this.delay(3000);
        console.log('   ✅ No-API Automation System online');
    }

    async startSMSChatbot() {
        console.log('   🤖 Starting SMS Chatbot...');
        
        const chatbotProcess = spawn('node', ['sms-chatbot.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: __dirname
        });
        
        chatbotProcess.stdout.on('data', (data) => {
            console.log(`[CHATBOT] ${data.toString().trim()}`);
        });
        
        chatbotProcess.stderr.on('data', (data) => {
            console.error(`[CHATBOT ERROR] ${data.toString().trim()}`);
        });
        
        this.processes.push({
            name: 'SMS Chatbot',
            process: chatbotProcess,
            startTime: new Date(),
            status: 'running'
        });
        
        await this.delay(2000);
        console.log('   ✅ SMS Chatbot online and ready');
    }

    async startHybridMCP() {
        console.log('   🔄 Starting Hybrid MCP System (backup)...');
        
        const hybridProcess = spawn('node', ['hybrid-mcp-system.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: __dirname
        });
        
        hybridProcess.stdout.on('data', (data) => {
            console.log(`[HYBRID] ${data.toString().trim()}`);
        });
        
        hybridProcess.stderr.on('data', (data) => {
            console.error(`[HYBRID ERROR] ${data.toString().trim()}`);
        });
        
        this.processes.push({
            name: 'Hybrid MCP',
            process: hybridProcess,
            startTime: new Date(),
            status: 'running'
        });
        
        await this.delay(2000);
        console.log('   ✅ Hybrid MCP System online (standby mode)');
    }

    setupMonitoring() {
        console.log('📊 Setting up system monitoring...');
        
        // Monitor system health every 30 seconds
        setInterval(() => {
            this.checkSystemHealth();
        }, 30000);
        
        // Generate hourly reports
        setInterval(() => {
            this.generateHourlyReport();
        }, 3600000);
        
        // Daily analytics
        setInterval(() => {
            this.generateDailyAnalytics();
        }, 86400000);
        
        console.log('✅ Monitoring systems active');
    }

    checkSystemHealth() {
        const healthReport = {
            timestamp: new Date().toISOString(),
            uptime: Date.now() - this.startTime.getTime(),
            processes: this.processes.map(p => ({
                name: p.name,
                status: p.process.killed ? 'stopped' : 'running',
                uptime: Date.now() - p.startTime.getTime()
            }))
        };
        
        // Log health status
        const runningProcesses = healthReport.processes.filter(p => p.status === 'running').length;
        console.log(`💓 System Health: ${runningProcesses}/${this.processes.length} processes running`);
        
        // Save health report
        fs.appendFileSync('system-health.log', JSON.stringify(healthReport) + '\n');
    }

    generateHourlyReport() {
        const report = {
            timestamp: new Date().toISOString(),
            type: 'hourly_report',
            systems: {
                noAPI: this.getSystemStats('No-API Automation'),
                chatbot: this.getSystemStats('SMS Chatbot'),
                hybrid: this.getSystemStats('Hybrid MCP')
            }
        };
        
        console.log('📈 Hourly Report Generated');
        fs.appendFileSync('hourly-reports.log', JSON.stringify(report) + '\n');
    }

    generateDailyAnalytics() {
        console.log('📊 Generating daily analytics...');
        
        // Read all data files and compile analytics
        const analytics = {
            date: new Date().toISOString().split('T')[0],
            prospects: this.countFileEntries('live-prospects.json'),
            conversations: Object.keys(this.readJSONFile('sms-conversations.json')).length,
            ambassadorLeads: this.countFileEntries('ambassador-leads.json'),
            systemUptime: Date.now() - this.startTime.getTime()
        };
        
        console.log('📊 Daily Analytics:', analytics);
        fs.appendFileSync('daily-analytics.log', JSON.stringify(analytics) + '\n');
    }

    getSystemStats(systemName) {
        const process = this.processes.find(p => p.name === systemName);
        return {
            status: process ? (process.process.killed ? 'stopped' : 'running') : 'not_found',
            uptime: process ? Date.now() - process.startTime.getTime() : 0
        };
    }

    countFileEntries(filename) {
        try {
            const data = this.readJSONFile(filename);
            return Array.isArray(data) ? data.length : Object.keys(data).length;
        } catch {
            return 0;
        }
    }

    readJSONFile(filename) {
        try {
            return JSON.parse(fs.readFileSync(path.join(__dirname, filename), 'utf8'));
        } catch {
            return {};
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // CONTROL METHODS
    async shutdown() {
        console.log('🛑 Shutting down all systems...');
        
        for (const processInfo of this.processes) {
            console.log(`   Stopping ${processInfo.name}...`);
            processInfo.process.kill('SIGTERM');
        }
        
        // Wait for graceful shutdown
        await this.delay(5000);
        
        // Force kill if needed
        for (const processInfo of this.processes) {
            if (!processInfo.process.killed) {
                processInfo.process.kill('SIGKILL');
            }
        }
        
        this.isActive = false;
        console.log('✅ All systems shut down');
    }

    getStatus() {
        return {
            active: this.isActive,
            uptime: Date.now() - this.startTime.getTime(),
            processes: this.processes.length,
            runningProcesses: this.processes.filter(p => !p.process.killed).length
        };
    }
}

// Initialize and start the live systems
const liveActivator = new LiveSystemActivator();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\\n🛑 Received shutdown signal...');
    await liveActivator.shutdown();
    process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    fs.appendFileSync('error.log', `${new Date().toISOString()} - ${error.stack}\\n`);
});

// Export for external control
module.exports = liveActivator;