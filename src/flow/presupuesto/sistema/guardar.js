import { addKeyword, EVENTS } from "@builderbot/bot";
import { appendToSheet } from "../../../services/sheets/index.js";

const SHEET_NAME = 'Sistema de autoprotección';

export const flowGuardarDatos = addKeyword(EVENTS.ACTION)
.addAction(async (_, { state }) => {
  await state.update({ menuActual: 'presupuestos' });
})  
.addAnswer(
  'Tu solicitud ha sido procesada con éxito. Pronto se pondrán en contacto contigo para brindarte más información. ¡Gracias!', null, 
  async (ctx, ctxFn, state) => {
    const actividad = ctxFn.state.get("actividad");
    const superficie = ctxFn.state.get("superficie");
    const subsuelos = ctxFn.state.get("subsuelos");
    const pisos = ctxFn.state.get("pisos");
    const grupo = ctxFn.state.get("grupo");
    const planosCAD = ctxFn.state.get("planosCAD");
    const planosPapel = ctxFn.state.get("planosPapel");
    const empresa = ctxFn.state.get("empresa");
    const empleados = ctxFn.state.get("empleados");
    const nombre = ctxFn.state.get("nombre");
    const email = ctxFn.state.get("email");
    const telefono = ctxFn.state.get("telefono");
    await appendToSheet(SHEET_NAME, [actividad, superficie, subsuelos, pisos, grupo, planosCAD, planosPapel, empleados, empresa, nombre, email, telefono]);
  }
);

export default flowGuardarDatos;