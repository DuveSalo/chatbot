import { createBot } from '@builderbot/bot'
import { MongoAdapter as Database } from '@builderbot/database-mongo'
import { providerMeta, providerBaileys } from './provider/index.js';
import { config } from './config/index.js';
import flows from './flow/index.js';

const PORT = config.PORT;

const main = async () => {
    let adapterProvider;
    if (config.provider === "meta") {
        adapterProvider = providerMeta;
    } else if (config.provider === "baileys") {
        adapterProvider = providerBaileys;
    } else {
        console.log("ERROR: Falta agregar un provider al .env")
    }


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
