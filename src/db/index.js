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
});

export const Cliente = mongoose.model('TestBot', ClienteSchema);

let connectionPromise = null;

export class MongoAdapter {
  static async getConnection(dbURI) {
    if (!connectionPromise) {
      connectionPromise = mongoose
        .connect(dbURI, { maxPoolSize: 10 })
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
}

export const mongoAdapter = new MongoAdapter(config.mongoDb_uri);
