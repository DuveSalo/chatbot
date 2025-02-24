import { createFlow } from "@builderbot/bot";
import { mainFlow } from "./main.js";
import { flowPreguntasIniciales } from './presupuesto/sistema/inicio.js'
import asistencia from "./presupuesto/asistencia.js"
import extintores from "./presupuesto/extintores.js"
import ergonomicos from "./presupuesto/ergonomicos.js"
import mediciones from "./presupuesto/mediciones.js"
import servicio from "./presupuesto/servicio.js"
import flowDeterminarGrupo from "./presupuesto/sistema/grupo.js";
import flowPlanosCAD from "./presupuesto/sistema/planosCAD.js";
import { flowPlanosPapel } from "./presupuesto/sistema/planosPapel.js";
import { flowPreguntasFinales } from "./presupuesto/sistema/final.js";
import flowGuardarDatos from "./presupuesto/sistema/guardar.js";

const flows = createFlow([
  mainFlow,
  flowPreguntasIniciales,
  flowDeterminarGrupo,
  flowPlanosCAD,
  flowPlanosPapel,
  flowPreguntasFinales,
  flowGuardarDatos,
  asistencia,
  extintores,
  ergonomicos,
  mediciones,
  servicio,
]);

export default flows;
