import { addKeyword, EVENTS } from "@builderbot/bot";
import { appendToSheet } from "../../services/sheets/index.js";

const SHEET_NAME = 'Asistencia Profesional';

export default addKeyword(EVENTS.ACTION)
  .addAction(async (_, { state }) => {
    await state.update({ menuActual: 'presupuestos'});
  })
  .addAnswer(
    'Para proporcionarte un presupuesto de asistencia profesional, necesito la siguiente información:'
  )
  .addAnswer('¿Tienen los planos de AutoCAD actualizados?', { capture: true },
    async (ctx, ctxFn) => {
      await ctxFn.state.update({ menuActual: 'presupuestos' });  
      await ctxFn.state.update({ "planos": ctx.body });
      }
  )
  .addAnswer('¿Cuál es la superficie del lugar?', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "superficie": ctx.body });
      }
  )

  .addAnswer('Finalmente, necesito la siguiente información de contacto:')
  .addAnswer('Por favor, proporciona tu nombre:', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "nombre": ctx.body });
      }
  )
  .addAnswer('Proporciona tu email:', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "email": ctx.body });
      }
  )
  .addAnswer('Finalmente, tu teléfono:', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "telefono": ctx.body });
      }
  )
  .addAnswer(
    'Tu solicitud ha sido procesada con éxito. Pronto se pondrán en contacto contigo para brindarte más información. ¡Gracias!', null,
    async (ctx, ctxFn) => {
      const planos = ctxFn.state.get("planos");
      const superficie = ctxFn.state.get("superficie");
      const nombre = ctxFn.state.get("nombre");
      const email = ctxFn.state.get("email");
      const telefono = ctxFn.state.get("telefono");
      await appendToSheet(SHEET_NAME, [planos, superficie, nombre, email, telefono]);
    }
  );
  