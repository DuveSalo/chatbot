import { addKeyword, EVENTS } from "@builderbot/bot";
import { flowPreguntasFinales } from './final.js';

export const flowPlanosPapel = addKeyword(EVENTS.ACTION)
.addAction(async () => {
})
  .addAnswer('¿Tienen planos en papel?', { capture: true }, async (ctx, { state, gotoFlow }) => {
    await state.update({ menuActual: 'presupuestos' });
    await state.update({ planosPapel: ctx.body });
    return gotoFlow(flowPreguntasFinales);
  });