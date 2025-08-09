  // Define las reglas de clasificación como un objeto estructurado para una mejor mantenibilidad.
  const CLASSIFICATION_RULES = {
    SISTEMA: {
      keywords: `"Defensa Civil", "planos de evacuación", "Sistemas de Autoprotección", "Ley 5920", "Disposición 356/DGDCIV/23", "Ley 5.641"`,
      exception: `Si el user pregunta únicamente si la empresa está habilitada para presentar planos de evacuación (sin mencionar términos de costo o adquisición), responde CONSULTA.`
    },
    EXTINTORES: {
      keywords: `"entrenamiento uso de extintores", "simulador de fuego", "Resolución SRT N°905/15 Inciso 15.2.2", "curso extintores"`,
      exception: `1. Si el user está interesado en adquirir los extintores o el simulador de extintor, responde CONSULTA. 2. Si el user consulta si los extintores son digitales o reales (y en este último caso, de qué tipo), responde CONSULTA. 3. Si el user consulta si los extintores deben ser proporcionados por él o si son provistos por la empresa, responde CONSULTA.`
    },
    SERVICIO: {
      keywords: `"higiene y seguridad", "Ley Nacional 19.587", "Planes Anuales de Prevención"`,
      exception: null
    },
    ERGONOMICOS: {
      keywords: `"Estudios ergonómicos", "Resolución MTSS N°295/03", "SRT 886/15"`,
      exception: null
    },
    MEDICIONES: {
      keywords: `"mediciones ambiente laboral", "iluminación", "estrés térmico", "nivel sonoro", "ventilación", "vibración", "contaminantes", "PAT", "UVC"`,
      exception: null
    },
    ASISTENCIA: {
      keywords: `"asistencia profesional", "simulación dinámica de humo/evacuación", "FDS (Fire Dynamics Simulator)", "NIST"`,
      exception: null
    }
  };

  const generatePromptDetermine = () => {
    const possibleResponses = ['CONSULTA', ...Object.keys(CLASSIFICATION_RULES)];

    const specificCategories = Object.entries(CLASSIFICATION_RULES).map(([category, { keywords, exception }]) => {
      let categoryRule = `- **${category}:** Cuando se mencione ${keywords}.`;
      if (exception) {
        categoryRule += `\n       - **Excepción:** ${exception}`;
      }
      return categoryRule;
    }).join('\n     ');

    return `
  Eres un clasificador de intenciones. Tu tarea es analizar la conversación entre el user y el assistant y determinar la intención principal del user, respondiendo únicamente con UNA SOLA PALABRA, sin agregar saludos, explicaciones o cualquier otro texto.

  Debes responder únicamente con una de las siguientes palabras:
  ${possibleResponses.map(r => `- ${r}`).join('\n')}

  Las reglas para clasificar son las siguientes:

  1.  **Consulta General**
      - Si el user realiza una pregunta general sobre los servicios de la empresa sin mencionar términos relacionados con costos, preci10
      b  os, adquisición o cualquier intención de contratación (ejemplos: "presupuesto", "costo", "precio", "valor", "tarifa", "adquirir", "honorarios", "cotización"), o simplemente saluda, la intención es general.
      - Responde: CONSULTA

  2.  **Solicitud de Presupuesto o Adquisición de Servicio**
      - Si el mensaje entrante del user contiene términos relacionados con costos, precios, honorarios, adquisición, etc., se debe proceder de la siguiente manera:
        - **Caso A:** Si el mensaje incluye estos términos pero **no especifica directamente** ningún servicio (por ejemplo, "¿cuánto cuesta?" o "¿cuáles serían los honorarios?"), se debe revisar el historial reciente de la conversación para identificar a qué servicio se hace referencia.
          - Si en el historial se han mencionado varios servicios, se selecciona **el último servicio mencionado** y se responde con la categoría correspondiente.
        - **Caso B:** Si el mensaje entrante contiene tanto un término relacionado con costos, adquisición, etc. con una palabra clave de algún servicio, se debe utilizar directamente la palabra clave mencionada en el mensaje, sin revisar el historial.

  3.  **Categorías Específicas de Servicio**
      - Si se detecta que la solicitud está asociada a la adquisición o presupuesto de un servicio, la categoría se determina según las siguientes palabras clave:
      ${specificCategories}

  Recuerda:  
  - La respuesta final debe ser una única palabra.  
  - Solo se responderá con SISTEMA, EXTINTORES, SERVICIO, ERGONOMICOS, MEDICIONES o ASISTENCIA cuando en la consulta se involucren términos de costos, precios o adquisición; de lo contrario, se responderá con CONSULTA.
  `;
  }

  export {generatePromptDetermine}