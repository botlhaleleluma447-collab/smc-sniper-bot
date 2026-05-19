# SMC Sniper Bot

Independent SMC sniper scalping bot using:
- MetaAPI
- Node.js
- Express
- MT5

## Features
- EURUSD & GBPUSD
- 0.01 / 0.02 lot sizes
- Start/Stop API
- Scalping logic
- Auto execution

## Install

```bash
npm install
```

## Run

```bash
npm start
```

## Configuration

Create a `.env` file based on `.env.example` and add your credentials:

```
METAAPI_TOKEN=your_token_here
ACCOUNT_ID=your_account_id_here
PORT=3000
```

## API Endpoints

- `GET /` - Check if bot is running
- `POST /start` - Start the bot
- `POST /stop` - Stop the bot