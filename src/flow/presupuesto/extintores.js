import { addKeyword, EVENTS } from "@builderbot/bot";
import { appendToSheet } from "../../services/sheets/index.js";

const SHEET_NAME = 'Entrenamiento en el uso de extintores';

export default addKeyword(EVENTS.ACTION)
  .addAction(async (_, { state }) => {
    await state.update({ menuActual: 'presupuestos'});
  })
  .addAnswer(
    'Para proporcionarte un presupuesto de entrenamiento en el uso de extintores, necesito la siguiente información:'
  )
  .addAnswer('¿Cuál es la ubicación del entrenamiento?', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "ubicacion": ctx.body });
      }
  )
  .addAnswer('¿Cuántos empleados participarán en el entrenamiento?', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "empleados": ctx.body });
      }
  )
  .addAnswer('¿El entrenamiento será teórico y práctico o solo teórico?', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "tipo": ctx.body });
      }
  )
  .addAnswer('¿El entrenamiento será durante el día o la noche?', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "horario": ctx.body });
      }
  )
  .addAnswer('Ahora necesito la siguiente información de contacto.')
  .addAnswer('Por favor, proporciona el nombre de la empresa:', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "empresa": ctx.body });
      }
  ) 
  .addAnswer('Proporciona tu nombre:', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "nombre": ctx.body });
      }
  )
  .addAnswer('Proporciona tu email:', { capture: true },
    async(ctx, {state, fallBack}) => {
        
        if(!ctx.body.includes('@')){
            return fallBack('El email ingresado no es válido. Por favor, proporciona uno correcto:')
        }
        await state.update({email:ctx.body.toLowerCase()})
    })
  .addAnswer('Finalmente, un número de teléfono:', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "telefono": ctx.body });
      }
  )
  .addAnswer(
    'Tu solicitud ha sido procesada con éxito. Pronto se pondrán en contacto contigo para brindarte más información. ¡Gracias!', null, 
    async (ctx, ctxFn) => {
      const ubicacion = ctxFn.state.get("ubicacion");
      const empleados = ctxFn.state.get("empleados");
      const tipo = ctxFn.state.get("tipo");
      const horario = ctxFn.state.get("horario");
      const empresa = ctxFn.state.get("empresa");
      const nombre = ctxFn.state.get("nombre");
      const email = ctxFn.state.get("email");
      const telefono = ctxFn.state.get("telefono");
      await appendToSheet(SHEET_NAME, [ubicacion, empleados, tipo, horario, empresa, nombre, email, telefono]);
    }
  );