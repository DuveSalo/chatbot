import { addKeyword, EVENTS } from "@builderbot/bot";
import { flowPlanosPapel } from './planosPapel.js';
import { flowPreguntasFinales } from './final.js';

export const flowPlanosCAD = addKeyword(EVENTS.ACTION)
.addAction(async () => {
})
  .addAnswer('¿Tienen los planos actualizados en CAD?', { capture: true }, async (ctx, { state, gotoFlow, flowDynamic }) => {
    await state.update({ menuActual: 'presupuestos' });
    await state.update({ planosCAD: ctx.body });
    const response = ctx.body.toLowerCase();

    if (response === 'no') {
      return gotoFlow(flowPlanosPapel);
    } else if (response === 'si' || response === 'sí') {
      return gotoFlow(flowPreguntasFinales);
    } else {
      await flowDynamic('Por favor, responde "si" o "no".');
      // Repetir la pregunta si la respuesta no es válida
      return gotoFlow(flowPlanosCAD);
    }
  });

export default flowPlanosCAD;