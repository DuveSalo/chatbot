import mongoose from 'mongoose';
import { config } from '../config/index.js';

// Esquema para el historial
const HistorySchema = new mongoose.Schema({
  pregunta: { type: String, required: true },
  respuesta: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
});

// Esquema para el cliente con solo nombre, número e historial
const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  numero: { type: String, required: true, unique: true },
  historial: [HistorySchema], // Relación con el historial
});

// Modelo de Mongoose para Cliente
export const Cliente = mongoose.model("TestBot", ClienteSchema);

// Clase MongoAdapter para manejar la base de datos
export class MongoAdapter {
  constructor(dbURI) {
    this.dbURI = dbURI;
    this.connect();
  }

  async connect() {
    try {
      await mongoose.connect(this.dbURI);
      console.log("Conectado a la base de datos MongoDB");
    } catch (error) {
      console.error("Error al conectar a MongoDB:", error);
    }
  }

  // Agregar o actualizar cliente (solo nombre, número e historial)
  async agregarOActualizarCliente(clienteData) {
    try {
      const clienteExistente = await Cliente.findOne({ numero: clienteData.numero });

      if (clienteExistente) {
        // Actualizar solo historial
        clienteExistente.historial = clienteData.historial;
        await clienteExistente.save();
        return clienteExistente;
      } else {
        const nuevoCliente = new Cliente(clienteData);
        await nuevoCliente.save();
        return nuevoCliente;
      }
    } catch (error) {
      console.error("Error al agregar o actualizar el cliente:", error);
      return null;
    }
  }

  // Buscar cliente por número
  async buscarClientePorNumero(numero) {
    return await Cliente.findOne({ numero }).exec();
  }

  // Agregar historial a un cliente
  async agregarHistorial(numeroCliente, historialData) {
    try {
      const cliente = await this.buscarClientePorNumero(numeroCliente);

      if (!cliente) {
        console.error(`Cliente con número ${numeroCliente} no encontrado.`);
        return null;
      }

      // Agregar la nueva entrada al historial
      cliente.historial.push(historialData);
      await cliente.save();
      return cliente;
    } catch (error) {
      console.error("Error al agregar historial:", error);
      return null;
    }
  }
}

export const mongoAdapter = new MongoAdapter(config.mongoDb_uri);