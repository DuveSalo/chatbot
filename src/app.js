import { createBot } from '@builderbot/bot'
import { MongoAdapter as Database } from '@builderbot/database-mongo'
import { config } from './config/index.js';
import flows from './flow/index.js';
import { provider } from './provider/index.js'

const PORT = config.PORT

const main = async () => {
    try {
        const { httpServer } = await createBot({
            flow: flows,
            provider: provider,
            database: new Database({
                dbUri: config.mongoDb_uri,
                dbName: config.mongoDb_name,
            })
        })

        httpServer(+PORT)
    } catch (error) {
        console.error("Error de app.js:", error);
    }
}
    
main()
