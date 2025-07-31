import { addKeyword, EVENTS } from "@builderbot/bot";
import { sendMail } from "../../services/mail/index.js"; 

const DEST_EMAIL = 'consultoraexcon@gmail.com';

export default addKeyword(EVENTS.ACTION)
  .addAction(async (_, { state }) => {
    await state.update({ menuActual: 'presupuestos'});
  })
  .addAnswer(
    'Para proporcionarte un presupuesto de mediciones del ambiente laboral, necesito la siguiente información:'
  )
  .addAnswer('¿Qué tipo de medición necesitas?', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "tipo": ctx.body });
      }
  )
  .addAnswer('¿La medición será puntual o ambiental?', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "puntual_ambiental": ctx.body });
      }
  )
  .addAnswer('¿Cuántos puestos hay que medir?', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "puestos": ctx.body });
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
      const tipo = ctxFn.state.get("tipo");
      const puntual_ambiental = ctxFn.state.get("puntal_ambiental");
      const puestos = ctxFn.state.get("puestos");
      const empresa = ctxFn.state.get("empresa");
      const nombre = ctxFn.state.get("nombre");
      const email = ctxFn.state.get("email");
      const telefono = ctxFn.state.get("telefono");
    
    const mailContent = `
    Se ha recibido una solicitud de presupuesto para una Medición del Ambiente Laboral con los siguientes detalles:
    - Nombre: ${nombre}
    - Email: ${email}
    - Teléfono: ${telefono}
    - Empresa: ${empresa}
    - Tipo de medición: ${tipo}
    - Puntual o ambiental: ${puntual_ambiental}
    - Puestos a medir: ${puestos}
          `;

    await sendMail({
      to: DEST_EMAIL,
      subject: 'Solicitud de Presupuesto para Medición del Ambiente Laboral',
      text: mailContent
    });

    // --- Bloquear al usuario tras completar el formulario ---
      await mongoAdapter.blockUser(ctx.from);

      // Finalizar flujo para usuario bloqueado
      return ctxFn.endFlow();

  }
  );