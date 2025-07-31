import mongoose from 'mongoose';
import { config } from '../config/index.js';

const HistorySchema = new mongoose.Schema({
  pregunta: { type: String, required: true },
  respuesta: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
});

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  numero: { type: String, required: true, unique: true, index: true },
  historial: { type: [HistorySchema], default: [] },
  ultimaInteraccion: { type: Date },
  isBlocked: { type: Boolean, default: false, index: true },
});

export const Cliente = mongoose.model('TestBot', ClienteSchema);

let connectionPromise = null;

export class MongoAdapter {
  static async getConnection(dbURI) {
    if (!connectionPromise) {
      connectionPromise = mongoose
        .connect(dbURI, { dbName: config.mongoDb_name, maxPoolSize: 10 })
        .then(() => {
          console.log('Conectado a MongoDB');
          return mongoose.connection;
        })
        .catch((error) => {
          console.error('Error al conectar a MongoDB:', error);
          throw error;
        });
    }
    return connectionPromise;
  }

  constructor(dbURI) {
    this.dbURI = dbURI;
    MongoAdapter.getConnection(dbURI);
  }

  async agregarOActualizarCliente(clienteData) {
    await MongoAdapter.getConnection(this.dbURI);
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const clienteExistente = await Cliente.findOne({ numero: clienteData.numero }).session(session);
      if (clienteExistente) {
        clienteExistente.historial = clienteData.historial;
        clienteExistente.ultimaInteraccion = new Date();
        await clienteExistente.save({ session });
        await session.commitTransaction();
        return clienteExistente;
      }

      const nuevoCliente = new Cliente(clienteData);
      nuevoCliente.ultimaInteraccion = new Date();
      await nuevoCliente.save({ session });
      await session.commitTransaction();
      return nuevoCliente;
    } catch (error) {
      await session.abortTransaction();
      console.error('Error al agregar o actualizar cliente:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async buscarClientePorNumero(numero) {
    await MongoAdapter.getConnection(this.dbURI);
    return Cliente.findOne({ numero }).exec();
  }

  async agregarHistorial(numeroCliente, historialData) {
    await MongoAdapter.getConnection(this.dbURI);
    const cliente = await Cliente.findOne({ numero: numeroCliente }).exec();
    if (!cliente) {
      console.error(`Cliente con número ${numeroCliente} no encontrado`);
      throw new Error(`Cliente no encontrado`);
    }
    cliente.historial.push(historialData);
    cliente.ultimaInteraccion = new Date();
    return cliente.save();
  }

  async blockUser(numero) {
    await MongoAdapter.getConnection(this.dbURI);
    try {
      const updatedUser = await Cliente.findOneAndUpdate(
        { numero: numero },
        { $set: { isBlocked: true } },
        { new: false } // Devuelve el documento original por defecto, no necesitamos el nuevo aquí
      ).exec();
      if (!updatedUser) {
         console.warn(`Attempted to block non-existent user: ${numero}`);
         // Podría lanzar un error si se prefiere manejarlo explícitamente
      }
      return updatedUser; // O simplemente retornar void o un booleano indicando éxito/fallo
    } catch (error) {
      console.error(`Error blocking user ${numero}:`, error);
      throw error; // Re-lanzar para manejo superior si es necesario
    }
  }

  async unblockUser(numero) {
    await MongoAdapter.getConnection(this.dbURI);
    try {
      const updatedUser = await Cliente.findOneAndUpdate(
        { numero: numero },
        { $set: { isBlocked: false } },
        { new: false }
      ).exec();
       if (!updatedUser) {
         console.warn(`Attempted to unblock non-existent user: ${numero}`);
         // Podría lanzar un error
      }
      return updatedUser; // O retornar indicación de éxito/fallo
    } catch (error) {
      console.error(`Error unblocking user ${numero}:`, error);
      throw error;
    }
  }

  async isUserBlocked(numero) {
    await MongoAdapter.getConnection(this.dbURI);
    try {
      const cliente = await Cliente.findOne(
          { numero: numero },
          { isBlocked: 1, _id: 0 } // Proyección para obtener solo isBlocked
      ).lean().exec(); // lean() para obtener un objeto JS plano

      // Si el cliente no existe, no está bloqueado.
      // Si existe y isBlocked es true, está bloqueado.
      // Si existe y isBlocked es false o undefined (por defecto), no está bloqueado.
      return cliente? cliente.isBlocked === true : false;
    } catch (error) {
      console.error(`Error checking block status for user ${numero}:`, error);
      throw error; // Re-lanzar para que el flujo que llama decida cómo proceder
    }
  }
}

export const mongoAdapter = new MongoAdapter(config.mongoDb_uri);
