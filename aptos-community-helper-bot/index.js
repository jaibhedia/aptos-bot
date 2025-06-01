const TelegramBot = require('node-telegram-bot-api');
const { AptosConfig, Aptos, Network } = require('@aptos-labs/ts-sdk');
const express = require('express');
require('dotenv').config();

class AptosService {
    constructor() {
        // Initialize Aptos client for both testnet and mainnet
        this.testnetConfig = new AptosConfig({ network: Network.TESTNET });
        this.mainnetConfig = new AptosConfig({ network: Network.MAINNET });
        this.testnetClient = new Aptos(this.testnetConfig);
        this.mainnetClient = new Aptos(this.mainnetConfig);
    }

    async getAccountBalance(address, useTestnet = true) {
        try {
            const client = useTestnet ? this.testnetClient : this.mainnetClient;
            const account = await client.getAccountResource({
                accountAddress: address,
                resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
            });
            
            const balance = account.coin.value;
            const formattedBalance = (parseInt(balance) / 100000000).toFixed(8);
            
            return {
                success: true,
                balance: formattedBalance,
                network: useTestnet ? 'Testnet' : 'Mainnet'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message.includes('Resource not found') 
                    ? 'Account not found or has no APT tokens'
                    : 'Unable to fetch balance'
            };
        }
    }

    isValidAddress(address) {
        const cleanAddress = address.startsWith('0x') ? address : `0x${address}`;
        return /^0x[a-fA-F0-9]{64}$/.test(cleanAddress) || /^0x[a-fA-F0-9]{1,64}$/.test(cleanAddress);
    }

    formatAddress(address) {
        if (!address.startsWith('0x')) {
            address = `0x${address}`;
        }
        return address.toLowerCase();
    }
}

class AIService {
    constructor() {
        this.knowledgeBase = {
            basics: {
                "what is aptos": "Aptos is a Layer 1 blockchain focused on safety, scalability, and usability. Built by former Meta engineers, it uses the Move programming language and offers parallel execution for high throughput.",
                "move language": "Move is a programming language designed for safe and flexible management of digital assets. It prevents common smart contract vulnerabilities and makes it easier to write secure code.",
                "aptos features": "Key features include parallel execution (up to 160,000 TPS), low gas fees, developer-friendly tools, and built-in safety mechanisms.",
            },
            projects: {
                "popular dapps": "Popular Aptos projects include Thala Protocol (DEX/lending), Chingari (social media), Petra Wallet, Pontem Network, and Aries Markets.",
                "defi projects": "Major DeFi projects: Thala Protocol, Aries Markets, Hippo Labs, Pancake Swap on Aptos, and Liquidswap.",
                "nft projects": "NFT platforms include Topaz, Souffl3, and BlueMove marketplace.",
            },
            development: {
                "getting started": "Start with the Aptos CLI, create a wallet using Petra, get testnet tokens from the faucet, and try the Move tutorial.",
                "tools": "Essential tools: Aptos CLI, Move IDE, Petra Wallet, TypeScript/Python SDK, and the Aptos Explorer.",
            }
        };
    }

    async generateResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        for (const category of Object.values(this.knowledgeBase)) {
            for (const [key, value] of Object.entries(category)) {
                if (message.includes(key) || key.split(' ').some(word => message.includes(word))) {
                    return `🤖 ${value}\n\nWould you like to know more about anything specific?`;
                }
            }
        }

        if (message.includes('help') || message.includes('start')) {
            return `👋 Welcome to the Aptos Community Helper Bot!\n\nI can help you with:\n• Aptos basics and concepts\n• Checking wallet balances\n• Finding testnet faucets\n• Learning about popular projects\n• Development resources\n\nJust ask me anything about Aptos!`;
        }

        if (message.includes('balance') || message.includes('wallet')) {
            return `💰 To check your wallet balance, use:\n/balance <your-address>\n\nExample:\n/balance 0x123...abc`;
        }

        if (message.includes('faucet') || message.includes('testnet')) {
            return `🚰 Get testnet APT tokens from the official faucet:\nhttps://aptoslabs.com/testnet-faucet\n\nYou'll need a testnet wallet address. Use Petra Wallet to create one!`;
        }

        return `🤔 I'm not sure about that, but I'm here to help with Aptos-related questions!\n\nTry asking about:\n• Aptos basics\n• DeFi projects\n• Development tools\n• Wallet help\n\nOr use /help to see all commands.`;
    }
}

class RateLimiter {
    constructor() {
        this.users = new Map();
        this.windowMs = 2000;
    }

    isAllowed(userId) {
        const now = Date.now();
        const userLastRequest = this.users.get(userId);
        
        if (!userLastRequest || (now - userLastRequest) > this.windowMs) {
            this.users.set(userId, now);
            return true;
        }
        
        return false;
    }
}

class AptosBot {
    constructor() {
        if (!process.env.TELEGRAM_BOT_TOKEN) {
            throw new Error('TELEGRAM_BOT_TOKEN is required in environment variables');
        }

        this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
        this.aptosService = new AptosService();
        this.aiService = new AIService();
        this.rateLimiter = new RateLimiter();
        
        this.setupCommands();
        this.setupMessageHandler();
        this.setupErrorHandler();
        
        console.log('🤖 Aptos Community Helper Bot started successfully!');
    }

    setupCommands() {
        this.bot.onText(/\/start/, (msg) => {
            if (!this.rateLimiter.isAllowed(msg.from.id)) return;
            
            const welcomeMessage = `🚀 Welcome to the Aptos Community Helper Bot!\n\nI'm your AI assistant for everything Aptos blockchain.\n\n🔧 Available Commands:\n/help - Show all commands\n/balance <address> - Check APT balance\n/faucet - Get testnet tokens\n/learn - Educational resources\n\n💬 You can also just chat with me about Aptos!`;
            
            this.bot.sendMessage(msg.chat.id, welcomeMessage);
        });

        this.bot.onText(/\/help/, (msg) => {
            if (!this.rateLimiter.isAllowed(msg.from.id)) return;
            
            const helpMessage = `📚 Aptos Helper Bot Commands:\n\n/start - Welcome message\n/help - This help menu\n/balance <address> - Check wallet balance\n/faucet - Testnet faucet links\n/learn - Learning resources\n\n💡 Pro Tips:\n• Ask me about Aptos concepts\n• Get info on DeFi projects\n• Learn about Move programming\n• Find development tools\n\nJust type your question naturally!`;
            
            this.bot.sendMessage(msg.chat.id, helpMessage);
        });

        this.bot.onText(/\/balance (.+)/, async (msg, match) => {
            if (!this.rateLimiter.isAllowed(msg.from.id)) return;
            
            const address = match[1].trim();
            
            if (!this.aptosService.isValidAddress(address)) {
                this.bot.sendMessage(msg.chat.id, '❌ Invalid Aptos address format.\n\nExample: /balance 0x123...abc');
                return;
            }

            const formattedAddress = this.aptosService.formatAddress(address);
            
            try {
                this.bot.sendMessage(msg.chat.id, '🔍 Checking balance...');
                
                const result = await this.aptosService.getAccountBalance(formattedAddress, true);
                
                if (result.success) {
                    const balanceMessage = `💰 **Balance Information**\n\n🏦 Address: \`${formattedAddress}\`\n💎 Balance: **${result.balance} APT**\n🌐 Network: ${result.network}\n\n📊 [View on Explorer](https://explorer.aptoslabs.com/account/${formattedAddress}?network=testnet)`;
                    
                    this.bot.sendMessage(msg.chat.id, balanceMessage, { parse_mode: 'Markdown' });
                } else {
                    this.bot.sendMessage(msg.chat.id, `❌ ${result.error}\n\nMake sure the address is correct and has been funded.`);
                }
            } catch (error) {
                console.error('Balance check error:', error);
                this.bot.sendMessage(msg.chat.id, '🚨 Error checking balance. Please try again later.');
            }
        });

        this.bot.onText(/\/faucet/, (msg) => {
            if (!this.rateLimiter.isAllowed(msg.from.id)) return;
            
            const faucetMessage = `🚰 **Aptos Testnet Faucet**\n\n💧 Get free testnet APT tokens:\n🔗 [Official Faucet](https://aptoslabs.com/testnet-faucet)\n\n📝 **How to use:**\n1. Create a wallet with Petra\n2. Copy your testnet address\n3. Paste it in the faucet\n4. Get 100 APT tokens!\n\n🔄 You can request tokens every hour.`;
            
            this.bot.sendMessage(msg.chat.id, faucetMessage, { parse_mode: 'Markdown' });
        });

        this.bot.onText(/\/learn/, (msg) => {
            if (!this.rateLimiter.isAllowed(msg.from.id)) return;
            
            const learnMessage = `📚 **Aptos Learning Resources**\n\n🎯 **For Beginners:**\n• [Aptos Documentation](https://aptos.dev/)\n• [Move Language Guide](https://move-language.github.io/move/)\n• [Petra Wallet Setup](https://petra.app/)\n\n🔨 **For Developers:**\n• [Aptos CLI Installation](https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli)\n• [TypeScript SDK](https://github.com/aptos-labs/aptos-core/tree/main/ecosystem/typescript/sdk)\n• [Move Tutorial](https://aptos.dev/tutorials/first-move-module)\n\n🏗️ **Popular Projects:**\n• Thala Protocol (DeFi)\n• Chingari (Social)\n• Aries Markets (Lending)\n\nAsk me about any of these topics!`;
            
            this.bot.sendMessage(msg.chat.id, learnMessage, { parse_mode: 'Markdown' });
        });
    }

    setupMessageHandler() {
        this.bot.on('message', async (msg) => {
            if (msg.text && msg.text.startsWith('/')) return;
            
            if (!this.rateLimiter.isAllowed(msg.from.id)) {
                this.bot.sendMessage(msg.chat.id, '⏰ Please wait 2 seconds between messages.');
                return;
            }

            if (msg.text) {
                try {
                    const response = await this.aiService.generateResponse(msg.text);
                    this.bot.sendMessage(msg.chat.id, response);
                } catch (error) {
                    console.error('AI response error:', error);
                    this.bot.sendMessage(msg.chat.id, '🤖 Sorry, I had trouble processing that. Try asking about Aptos, DeFi, or development!');
                }
            }
        });
    }

    setupErrorHandler() {
        this.bot.on('error', (error) => {
            console.error('Bot error:', error);
        });

        this.bot.on('polling_error', (error) => {
            console.error('Polling error:', error);
        });
    }
}

const app = express();
app.get('/', (req, res) => {
    res.json({ status: 'Aptos Community Helper Bot is running!', timestamp: new Date() });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', uptime: process.uptime() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Health check server running on port ${PORT}`);
});

try {
    new AptosBot();
} catch (error) {
    console.error('Failed to start bot:', error.message);
    process.exit(1);
}

process.on('SIGINT', () => {
    console.log('Shutting down bot...');
    process.exit(0);
});
