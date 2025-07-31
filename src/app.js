import { createBot, createProvider } from '@builderbot/bot'
import { MongoAdapter as Database } from '@builderbot/database-mongo'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
import { config } from './config/index.js';
import flows from './flow/index.js';

const PORT = config.PORT;

const main = async () => {
    const adapterProvider = createProvider(Provider, {version: [2, 3000, 1023223821]});
    const adapterDB = new Database({
        dbUri: config.mongoDb_uri,
        dbName: config.mongoDb_name,
    })

    const { httpServer } = await createBot({
        flow: flows,
        provider: adapterProvider,
        database: adapterDB,
    });

    httpServer(+PORT);
};

main();
