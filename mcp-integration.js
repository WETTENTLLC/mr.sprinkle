// MCP (Model Context Protocol) Integration for Live AI Outbound
// Connects to local AI models and free services
(function() {
    'use strict';
    
    class MCPOutboundConnector {
        constructor() {
            this.mcpServers = new Map();
            this.activeConnections = new Set();
            this.messageQueue = [];
            
            this.init();
        }
        
        async init() {
            console.log('🔌 Initializing MCP connections...');
            
            // Connect to available MCP servers
            await this.connectToMCPServers();
            
            // Setup free AI service fallbacks
            this.setupFreeAIServices();
            
            // Start message processing
            this.startMessageProcessor();
        }
        
        async connectToMCPServers() {
            // Common MCP server endpoints
            const mcpEndpoints = [
                { name: 'local-llama', url: 'http://localhost:11434/api/generate', type: 'ollama' },
                { name: 'local-gpt4all', url: 'http://localhost:4891/v1/chat/completions', type: 'gpt4all' },
                { name: 'local-lmstudio', url: 'http://localhost:1234/v1/chat/completions', type: 'lmstudio' }
            ];
            
            for (const endpoint of mcpEndpoints) {
                try {
                    const isAvailable = await this.testMCPConnection(endpoint);
                    if (isAvailable) {
                        this.mcpServers.set(endpoint.name, endpoint);
                        this.activeConnections.add(endpoint.name);
                        console.log(`✅ Connected to ${endpoint.name}`);
                    }
                } catch (error) {
                    console.log(`❌ Failed to connect to ${endpoint.name}`);
                }
            }
            
            if (this.activeConnections.size === 0) {
                console.log('⚡ No local MCP servers found, using free cloud services');
            }
        }
        
        async testMCPConnection(endpoint) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                
                const response = await fetch(endpoint.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.getTestPayload(endpoint.type)),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                return response.ok;
            } catch (error) {
                return false;
            }
        }
        
        getTestPayload(type) {
            switch (type) {
                case 'ollama':
                    return {
                        model: 'llama2',
                        prompt: 'Test',
                        stream: false
                    };
                case 'gpt4all':
                case 'lmstudio':
                    return {
                        model: 'gpt-3.5-turbo',
                        messages: [{ role: 'user', content: 'Test' }],
                        max_tokens: 10
                    };
                default:
                    return { prompt: 'Test' };
            }
        }
        
        setupFreeAIServices() {
            // Free AI services configuration
            this.freeServices = {
                huggingface: {
                    endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
                    headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('hf_token') || '') }
                },
                cohere: {
                    endpoint: 'https://api.cohere.ai/v1/generate',
                    headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('cohere_token') || '') }
                },
                replicate: {
                    endpoint: 'https://api.replicate.com/v1/predictions',
                    headers: { 'Authorization': 'Token ' + (localStorage.getItem('replicate_token') || '') }
                }
            };
            
            console.log('🆓 Free AI services configured');
        }
        
        async generateMessage(prompt, context = {}) {
            // Try MCP servers first (local, free)
            if (this.activeConnections.size > 0) {
                const result = await this.tryMCPGeneration(prompt, context);
                if (result) return result;
            }
            
            // Fallback to free cloud services
            const result = await this.tryFreeServices(prompt, context);
            if (result) return result;
            
            // Final fallback to template generation
            return this.generateTemplateMessage(prompt, context);
        }
        
        async tryMCPGeneration(prompt, context) {
            for (const serverName of this.activeConnections) {
                try {
                    const server = this.mcpServers.get(serverName);
                    const result = await this.callMCPServer(server, prompt, context);
                    if (result) {
                        console.log(`✅ Generated via ${serverName}`);
                        return result;
                    }
                } catch (error) {
                    console.log(`❌ ${serverName} failed:`, error.message);
                }
            }
            return null;
        }
        
        async callMCPServer(server, prompt, context) {
            const fullPrompt = this.buildContextualPrompt(prompt, context);
            
            let payload;
            switch (server.type) {
                case 'ollama':
                    payload = {
                        model: 'llama2',
                        prompt: fullPrompt,
                        stream: false,
                        options: { temperature: 0.7, num_predict: 150 }
                    };
                    break;
                    
                case 'gpt4all':
                case 'lmstudio':
                    payload = {
                        model: 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: 'You are a social media outreach expert for Mr. Sprinkle custom grillz business in Reno, Nevada.' },
                            { role: 'user', content: fullPrompt }
                        ],
                        max_tokens: 150,
                        temperature: 0.7
                    };
                    break;
            }
            
            const response = await fetch(server.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            // Extract response based on server type
            switch (server.type) {
                case 'ollama':
                    return data.response;
                case 'gpt4all':
                case 'lmstudio':
                    return data.choices?.[0]?.message?.content;
                default:
                    return data.text || data.response;
            }
        }
        
        buildContextualPrompt(prompt, context) {
            return `Create a personalized social media outreach message for Mr. Sprinkle custom grillz business.
            
Business: Mr. Sprinkle - Premium custom gold grillz since 2002
Location: Reno, Nevada
Services: Custom gold grillz, gold press-on nails, mobile service
Guarantee: Medical-grade dental gold, no tarnish guarantee

Target prospect:
Platform: ${context.platform || 'Instagram'}
Username: ${context.username || 'user'}
Location: ${context.location || 'Nevada'}
Interests: ${context.interests || 'fashion, music'}
Content: ${context.content || 'lifestyle posts'}

Requirements:
- Keep message under 150 characters
- Include call-to-action
- Mention FREE consultation
- Be authentic and personal
- Include contact: (530) 214-0676

Generate message:`;
        }
        
        async tryFreeServices(prompt, context) {
            // Try Hugging Face first (completely free)
            try {
                const hfResult = await this.callHuggingFace(prompt, context);
                if (hfResult) {
                    console.log('✅ Generated via Hugging Face');
                    return hfResult;
                }
            } catch (error) {
                console.log('❌ Hugging Face failed');
            }
            
            // Try Cohere (free tier)
            try {
                const cohereResult = await this.callCohere(prompt, context);
                if (cohereResult) {
                    console.log('✅ Generated via Cohere');
                    return cohereResult;
                }
            } catch (error) {
                console.log('❌ Cohere failed');
            }
            
            return null;
        }
        
        async callHuggingFace(prompt, context) {
            const token = localStorage.getItem('hf_token');
            if (!token) {
                console.log('💡 Add Hugging Face token: localStorage.setItem("hf_token", "your_token")');
                return null;
            }
            
            const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: this.buildContextualPrompt(prompt, context),
                    parameters: { max_length: 150, temperature: 0.7 }
                })
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            return data[0]?.generated_text?.split('Generate message:')[1]?.trim();
        }
        
        async callCohere(prompt, context) {
            const token = localStorage.getItem('cohere_token');
            if (!token) {
                console.log('💡 Add Cohere token: localStorage.setItem("cohere_token", "your_token")');
                return null;
            }
            
            const response = await fetch('https://api.cohere.ai/v1/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'command-light',
                    prompt: this.buildContextualPrompt(prompt, context),
                    max_tokens: 150,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            return data.generations?.[0]?.text?.trim();
        }
        
        generateTemplateMessage(prompt, context) {
            // Smart template selection based on context
            const templates = {
                music: [
                    `🎵 Your music content is fire! Custom grillz would complete that artist look. Mr. Sprinkle - Reno's #1 since 2002. FREE consultation! (530) 214-0676`,
                    `🔥 That musical talent deserves custom gold! Mr. Sprinkle creates pieces for artists. FREE mobile service in ${context.location || 'Nevada'}!`
                ],
                fashion: [
                    `💎 Your style is incredible! Custom gold grillz would be perfect for you. Mr. Sprinkle - 20+ years experience. FREE consultation! Text (530) 214-0676`,
                    `✨ Love your fashion sense! You need custom grillz to match. Mr. Sprinkle - Reno's finest. Check our work: mrsprinklereno.com`
                ],
                lifestyle: [
                    `🔥 Your lifestyle content is amazing! Custom grillz would elevate your look. Mr. Sprinkle - medical-grade gold guarantee. FREE consultation!`,
                    `⚡ That confidence needs custom gold to match! Mr. Sprinkle creates premium pieces. Mobile service available! (530) 214-0676`
                ],
                business: [
                    `💼 Love your business content! Custom grillz could be perfect for your brand. Mr. Sprinkle - Reno's premier jeweler. Let's discuss partnership!`,
                    `🤝 Your business has great style! Custom gold pieces could enhance your brand. Mr. Sprinkle - 20+ years experience. FREE consultation!`
                ]
            };
            
            // Determine category from context
            let category = 'lifestyle';
            const content = (context.content || '').toLowerCase();
            const interests = (context.interests || '').toLowerCase();
            
            if (content.includes('music') || interests.includes('music')) category = 'music';
            else if (content.includes('fashion') || interests.includes('fashion')) category = 'fashion';
            else if (content.includes('business') || interests.includes('business')) category = 'business';
            
            const categoryTemplates = templates[category];
            const selectedTemplate = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
            
            console.log(`📝 Generated template message (${category})`);
            return selectedTemplate;
        }
        
        startMessageProcessor() {
            // Process message queue every 30 seconds
            setInterval(() => {
                if (this.messageQueue.length > 0) {
                    const message = this.messageQueue.shift();
                    this.processMessage(message);
                }
            }, 30000);
        }
        
        async processMessage(messageRequest) {
            try {
                const result = await this.generateMessage(messageRequest.prompt, messageRequest.context);
                
                if (messageRequest.callback) {
                    messageRequest.callback(result);
                }
                
                // Log successful generation
                console.log('✅ Message generated and processed');
                
            } catch (error) {
                console.error('❌ Message processing failed:', error);
                
                if (messageRequest.callback) {
                    messageRequest.callback(null, error);
                }
            }
        }
        
        // Public API
        queueMessage(prompt, context, callback) {
            this.messageQueue.push({ prompt, context, callback });
            console.log(`📥 Message queued (${this.messageQueue.length} in queue)`);
        }
        
        async generateMessageSync(prompt, context) {
            return await this.generateMessage(prompt, context);
        }
        
        getStatus() {
            return {
                mcpServers: Array.from(this.activeConnections),
                queueLength: this.messageQueue.length,
                freeServicesConfigured: Object.keys(this.freeServices).filter(service => 
                    localStorage.getItem(`${service}_token`) || localStorage.getItem(`${service.replace('huggingface', 'hf')}_token`)
                ).length
            };
        }
        
        // Setup helpers
        setupInstructions() {
            console.log(`
🔧 MCP SETUP INSTRUCTIONS:

LOCAL AI (Free):
1. Install Ollama: https://ollama.ai
2. Run: ollama pull llama2
3. Start: ollama serve

OR

1. Install LM Studio: https://lmstudio.ai
2. Download any model
3. Start local server

FREE CLOUD SERVICES:
1. Hugging Face: Get free token at https://huggingface.co/settings/tokens
   localStorage.setItem('hf_token', 'your_token')

2. Cohere: Get free tier at https://cohere.ai
   localStorage.setItem('cohere_token', 'your_token')

3. Gemini: Get free API key at https://makersuite.google.com/app/apikey
   localStorage.setItem('gemini_api_key', 'your_key')

ULTRA-CHEAP OPTIONS:
1. DeepSeek: $0.14/1M tokens at https://platform.deepseek.com
   localStorage.setItem('deepseek_api_key', 'your_key')

2. Together AI: $0.20/1M tokens at https://api.together.xyz
   localStorage.setItem('together_api_key', 'your_key')
            `);
        }
    }
    
    // Initialize MCP connector
    const mcpConnector = new MCPOutboundConnector();
    
    // Make globally accessible
    window.MCPOutboundConnector = mcpConnector;
    
    // Show setup instructions
    mcpConnector.setupInstructions();
    
    console.log('🔌 MCP Integration Ready - Connect your local AI or use free services!');
    
})();