import { addKeyword, EVENTS } from "@builderbot/bot";
import { flowGuardarDatos } from './guardar.js';

export const flowPreguntasFinales = addKeyword(EVENTS.ACTION)
.addAction(async () => {
})
  .addAnswer('¿Cuál es el nombre de la empresa?', { capture: true }, async (ctx, { state }) => {
    await state.update({ empresa: ctx.body });
  })
  .addAnswer('¿Cuántos empleados tiene la empresa?', { capture: true }, async (ctx, { state }) => {
    await state.update({ empleados: ctx.body });
  })
  .addAnswer('¿Cuál es tu nombre?', { capture: true }, async (ctx, { state }) => {
    await state.update({ nombre: ctx.body });
  })
  .addAnswer('Proporciona tu email:', { capture: true }, async (ctx, { state, fallBack }) => {
    const email = ctx.body.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fallBack('El email ingresado no es válido. Por favor, proporciona uno correcto:');
    }
    await state.update({ email: email });
  })
  .addAnswer('¿Cuál es tu número de teléfono?', { capture: true }, async (ctx, { state, gotoFlow }) => {
    await state.update({ telefono: ctx.body });
    return gotoFlow(flowGuardarDatos);
  });
  