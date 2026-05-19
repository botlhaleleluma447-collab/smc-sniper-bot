require('dotenv').config();

const express = require('express');
const MetaApi = require('metaapi.cloud-sdk').default;
const cron = require('node-cron');

const app = express();

app.use(express.json());

const token = process.env.METAAPI_TOKEN;
const accountId = process.env.ACCOUNT_ID;

const api = new MetaApi(token);

let botRunning = false;

const CONFIG = {
    symbols: ['EURUSD', 'GBPUSD'],
    lotSmall: 0.01,
    lotStrong: 0.02,
    maxTrades: 2,
    takeProfitPips: 10,
    stopLossPips: 6
};

async function connectAccount() {
    const account = await api.metatraderAccountApi.getAccount(accountId);

    if (account.state !== 'DEPLOYED') {
        console.log('Deploying account...');
        await account.deploy();
    }

    await account.waitConnected();

    const connection = account.getRPCConnection();

    await connection.connect();
    await connection.waitSynchronized();

    return connection;
}

function randomSignal() {
    const signals = ['BUY', 'SELL', null];
    return signals[Math.floor(Math.random() * signals.length)];
}

async function executeTrade(connection, symbol, type) {
    try {

        const lot =
            Math.random() > 0.7
                ? CONFIG.lotStrong
                : CONFIG.lotSmall;

        console.log(`${type} ${symbol} ${lot}`);

        if (type === 'BUY') {
            await connection.createMarketBuyOrder(
                symbol,
                lot,
                0,
                0,
                'SMC BOT BUY'
            );
        }

        if (type === 'SELL') {
            await connection.createMarketSellOrder(
                symbol,
                lot,
                0,
                0,
                'SMC BOT SELL'
            );
        }

    } catch (err) {
        console.log(err.message);
    }
}

async function runBot() {

    if (!botRunning) return;

    try {

        const connection = await connectAccount();

        for (const symbol of CONFIG.symbols) {

            const signal = randomSignal();

            if (!signal) {
                console.log(`No setup for ${symbol}`);
                continue;
            }

            console.log(`Signal detected ${signal} ${symbol}`);

            await executeTrade(
                connection,
                symbol,
                signal
            );
        }

    } catch (err) {
        console.log(err.message);
    }
}

cron.schedule('*/1 * * * *', async () => {
    await runBot();
});

app.post('/start', (req, res) => {
    botRunning = true;

    console.log('BOT STARTED');

    res.json({
        success: true,
        message: 'Bot started'
    });
});

app.post('/stop', (req, res) => {
    botRunning = false;

    console.log('BOT STOPPED');

    res.json({
        success: true,
        message: 'Bot stopped'
    });
});

app.get('/', (req, res) => {
    res.send('SMC Sniper Bot Running');
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});