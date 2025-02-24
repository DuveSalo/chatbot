import { addKeyword, EVENTS } from "@builderbot/bot";
import { flowDeterminarGrupo } from './grupo.js';

export const flowPreguntasIniciales = addKeyword(EVENTS.ACTION)
.addAction(async () => {
})
    .addAnswer('Para proporcionarte un presupuesto para un sistema de autoprotección, necesito la siguiente información:')
    .addAnswer('¿Cuál es la actividad principal de la empresa?', { capture: true }, async (ctx, { state }) => {
        await state.update({ actividad: ctx.body });
    })
    .addAnswer('¿Cuál es la superficie cubierta en metros cuadrados?', { capture: true }, async (ctx, { state }) => {
        await state.update({ superficie: ctx.body });
    })
    .addAnswer('¿Cuántos subsuelos tiene el edificio?', { capture: true }, async (ctx, { state }) => {
        await state.update({ subsuelos: ctx.body });
    })
    .addAnswer('¿Cuántos pisos tiene el edificio?', { capture: true }, async (ctx, { state, gotoFlow }) => {
        await state.update({ pisos: ctx.body });
        return gotoFlow(flowDeterminarGrupo);
    });

export default flowPreguntasIniciales;