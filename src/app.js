import { createBot, createProvider } from '@builderbot/bot'
import { MongoAdapter as Database } from '@builderbot/database-mongo'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { config } from './config/index.js';
import flows from './flow/index.js';

const PORT = config.PORT

const main = async () => {   
    const adapterFlow = flows;
    
    const adapterProvider = createProvider(Provider)
        const adapterDB = new Database({
        dbUri: config.mongoDb_uri,
        dbName: config.mongoDb_name,
    })

    const { httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    
    httpServer(+PORT)
}
    
main()
