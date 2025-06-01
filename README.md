# Aptos Community Helper Bot

An AI-powered Telegram bot that helps newcomers navigate the Aptos blockchain ecosystem with real-time blockchain integration and educational support. Built for the Aptos AI Agent Thunderdome hackathon (“Most Unique Agent” category).

## Features
- Natural language responses about Aptos concepts, DeFi, NFTs, and development  
- Telegram commands: `/start`, `/help`, `/balance `, `/faucet`, `/learn`  
- Live balance checking on Aptos testnet & mainnet  
- Address validation & explorer links  
- Educational resources and curated learning paths  
- Rate limiting (2-second cooldown) and error handling  
- Health check endpoint for uptime monitoring  

## Prerequisites
- Node.js v18 or higher  
- npm (or yarn)  
- A Telegram Bot Token from [@BotFather](https://t.me/BotFather)  
- (For deployment) Railway or Heroku account  

## Installation

1. Clone the repository  
   ```bash
   git clone https://github.com/your-username/aptos-community-helper-bot.git
   cd aptos-community-helper-bot
   ```

2. Install dependencies  
   ```bash
   npm install
   ```

3. Create your environment file  
   ```bash
   cp .env.example .env
   ```

4. Open `.env` and set your bot token:  
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCDEF-your-bot-token
   PORT=3000
   NODE_ENV=development
   ```

## Usage

### Run Locally
```bash
npm run dev       # Development mode with live reload
npm start         # Production mode
```

### Available Commands

| Command                   | Description                                  |
|---------------------------|----------------------------------------------|
| /start                    | Welcome message and introduction             |
| /help                     | List all commands                            |
| /balance ``      | Check APT balance for a given address        |
| /faucet                   | Get Aptos testnet faucet link & instructions |
| /learn                    | Show learning resources and project links    |

You can also ask natural questions like:
- “What is Aptos?”  
- “How do I get testnet tokens?”  
- “Tell me about Move programming.”  

## Health Check

The bot runs an Express server on the same port. Verify health by visiting:
```
GET http://localhost:3000/health
```
Response:
```json
{ "status": "healthy", "uptime": 123.45 }
```

## Deployment

### Railway

1. Install Railway CLI  
   ```bash
   npm install -g @railway/cli
   ```
2. In your project folder, login and initialize:  
   ```bash
   railway login
   railway init
   ```
3. Set environment variables:  
   ```bash
   railway variables upsert TELEGRAM_BOT_TOKEN "123456789:ABCDEF-your-bot-token"
   railway variables upsert NODE_ENV production
   ```
4. Deploy:  
   ```bash
   railway up
   ```
5. View logs & URL:  
   ```bash
   railway logs --tail
   ```
   Your bot will be live at `https://.up.railway.app`

### Heroku

1. Login & create app  
   ```bash
   heroku login
   heroku create your-app-name
   ```
2. Add Procfile  
   ```text
   web: node index.js
   ```
3. Set config vars  
   ```bash
   heroku config:set TELEGRAM_BOT_TOKEN=123456789:ABCDEF-your-bot-token
   heroku config:set NODE_ENV=production
   ```
4. Deploy via Git  
   ```bash
   git push heroku main
   heroku ps:scale web=1
   ```
5. Tail logs  
   ```bash
   heroku logs --tail
   ```

## Project Structure
```
.
├── index.js           # Main application
├── package.json       # Dependencies & scripts
├── .env.example       # Env var template
├── README.md          # Project documentation
└── docs/              # Additional guides (optional)
    ├── SETUP.md
    ├── DEPLOYMENT.md
    └── HACKATHON.md
```

## Scripts

- `npm run dev` – Start in development mode  
- `npm start` – Start in production mode  
- `npm test` – Run any tests (if added)  

## Contributing
1. Fork the repo  
2. Create a new branch (`git checkout -b feature/my-feature`)  
3. Commit your changes (`git commit -m "Add feature"`)  
4. Push to your branch (`git push origin feature/my-feature`)  
5. Open a Pull Request  

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Aptos Labs for the blockchain SDK and resources  
- Cracked Labs for organizing the AI Agent Thunderdome  
- Telegram for the Bot API  
- The Aptos community for feedback and support  
