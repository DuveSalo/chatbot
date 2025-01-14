import { createBot } from '@builderbot/bot'
import { MongoAdapter as Database } from '@builderbot/database-mongo'
import { provider } from './provider/index.js';
import { config } from './config/index.js';
import flows from './flow/index.js';

const PORT = config.PORT

const main = async () => {
    const { httpServer } = await createBot ({
        flow: flows,
        provider: provider,
        database: new Database({
            dbUri: config.mongoDb_uri,
            dbName: config.mongoDb_name,
        })
    })
    
<<<<<<< HEAD
=======
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

    
>>>>>>> 3e486d3cc9792e1f3c668115ef79c539dbc7d832
    httpServer(+PORT)
}
    
main()
