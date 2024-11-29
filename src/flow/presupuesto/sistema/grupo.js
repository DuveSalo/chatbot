import { addKeyword, EVENTS } from "@builderbot/bot";
import { run } from '../../../services/openai/index.js';
import generarPrompt from './prompt.js';
import { flowPlanosCAD } from './planosCAD.js';

export const flowDeterminarGrupo = addKeyword(EVENTS.ACTION)
.addAction(async (_, { state }) => {
})
  .addAction(async (ctx, { state, gotoFlow }) => {
    // Obtener las respuestas del usuario desde el estado
    const actividad = ((await state.get('actividad')) || '').trim();
    const superficie = ((await state.get('superficie')) || '').trim();
    const subsuelos = ((await state.get('subsuelos')) || '').trim();
    const pisos = ((await state.get('pisos')) || '').trim();

    // Verificar que todas las respuestas estén presentes
    if (
      actividad === '' ||
      superficie === '' ||
      subsuelos === '' ||
      subsuelos === null ||
      subsuelos === undefined ||
      pisos === '' ||
      pisos === null ||
      pisos === undefined
    ) {
      console.error("Información incompleta para determinar el grupo");
      await state.update({ grupo: 'Información insuficiente debido a datos incompletos' });
      return gotoFlow(flowPlanosCAD);
    }

    // Generar el prompt utilizando la función y las variables
    const prompt = generarPrompt(actividad, superficie, subsuelos, pisos);

    // Eliminar el console.log que imprime el prompt para evitar salida excesiva en la terminal
    // console.log('Prompt enviado a OpenAI:', prompt);

    // Crear el historial de mensajes para pasar a la función run
    const history = [
      { role: 'user', content: prompt }
    ];

    // Llamar a la función run de chatGPT.js para obtener el grupo
    let response;
    try {
      response = await run('User', history);
      // Puedes comentar el siguiente console.log si no deseas que aparezca en la terminal
      // console.log('Respuesta de OpenAI:', response);
    } catch (error) {
      console.error(`Error al ejecutar la función run: ${error.message}`);
      await state.update({ grupo: 'No se pudo obtener el grupo debido a un error en la función de procesamiento.' });
      return gotoFlow(flowPlanosCAD);
    }

    // Capturar la respuesta y guardarla en el estado como "grupo"
    if (response && response.content) {
      const grupo = response.content.trim();
      await state.update({ grupo });
      // Puedes comentar el siguiente console.log si no deseas que aparezca en la terminal
      // console.log('Grupo almacenado:', await state.get('grupo'));
    }

    // Continuar al flujo flowPlanosCAD
    return gotoFlow(flowPlanosCAD);
  });

export default flowDeterminarGrupo;