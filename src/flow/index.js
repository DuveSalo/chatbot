import { createFlow } from "@builderbot/bot";
import { mainFlow } from "./main.js";
import { flowPreguntasIniciales } from './presupuesto/sistema/inicio.js'
import asistencia from "./presupuesto/asistencia.js"
import extintores from "./presupuesto/extintores.js"
import ergonomicos from "./presupuesto/ergonomicos.js"
import mediciones from "./presupuesto/mediciones.js"
import servicio from "./presupuesto/servicio.js"

const flows = createFlow([
  mainFlow,
  flowPreguntasIniciales,
  asistencia,
  extintores,
  ergonomicos,
  mediciones,
  servicio,
]);

export default flows;
