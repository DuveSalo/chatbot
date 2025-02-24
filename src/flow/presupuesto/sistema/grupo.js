import { addKeyword, EVENTS } from '@builderbot/bot';
import { DetermineGrupo } from '../../../services/openai/index.js';
import { flowPlanosCAD } from './planosCAD.js';

export const flowDeterminarGrupo = addKeyword(EVENTS.ACTION)
  .addAction(async (ctx, { state, gotoFlow, flowDynamic }) => { // Agregué flowDynamic aquí
    try {
      // Obtener las respuestas del usuario desde el state
      const actividad = ((await state.get('actividad')) || '').trim();
      const superficie = ((await state.get('superficie')) || '').trim();
      const subsuelos = ((await state.get('subsuelos')) || '').trim();
      const pisos = ((await state.get('pisos')) || '').trim();

      // Verificar que todas las respuestas estén presentes
      if (
        actividad === '' ||
        superficie === '' ||
        subsuelos === '' ||
        pisos === ''
      ) {
        console.error('Información incompleta para determinar el grupo');
        await state.update({ grupo: 'Información insuficiente debido a datos incompletos' });
        return gotoFlow(flowPlanosCAD);
      }

      // Mensaje intermedio para informar al usuario
      await flowDynamic(
        'Estamos calculando el grupo al que pertenece tu empresa según tus respuestas. Espera un segundo, luego te haremos más preguntas...'
      );

      try {
        // Llamamos a la función DetermineGrupo con los datos
        const grupo = await DetermineGrupo(actividad, superficie, subsuelos, pisos);

        // Guardamos el resultado en el state
        await state.update({ grupo: grupo || 'No se pudo obtener el grupo.' });
      } catch (error) {
        console.error(`Error al llamar a DetermineGrupo: ${error.message}`);
        await state.update({ grupo: 'No se pudo obtener el grupo debido a un error.' });
      }

      // Continuamos con el siguiente flow
      return gotoFlow(flowPlanosCAD);
    } catch (error) {
      console.error('Error en flowDeterminarGrupo:', error);
      await state.update({ grupo: 'Error inesperado al determinar el grupo.' });
      // Mensaje de error para el usuario
      await flowDynamic('Ocurrió un error al calcular el grupo. Continuaremos con las siguientes preguntas.');
      return gotoFlow(flowPlanosCAD);
    }
  });

export default flowDeterminarGrupo;