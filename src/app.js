import { createBot, createProvider } from '@builderbot/bot'
import { MongoAdapter as Database } from '@builderbot/database-mongo'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { config } from './config/index.js';
import flows from './flow/index.js';

const PORT = config.PORT

const main = async () => {
    const { httpServer } = await createBot ({
        flow: flows,
        provider: createProvider(BaileysProvider),
        database: new Database({
            dbUri: config.mongoDb_uri,
            dbName: config.mongoDb_name,
        })
    })
    
    httpServer(+PORT)
}
    
main()
