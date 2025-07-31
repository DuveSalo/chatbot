import { addKeyword, EVENTS } from "@builderbot/bot";
import { sendMail } from "../../services/mail/index.js"; 

const DEST_EMAIL = 'consultoraexcon@gmail.com';

export default addKeyword(EVENTS.ACTION)  
  .addAction(async (_, { state }) => {
    await state.update({ menuActual: 'presupuestos'});
  })
  .addAnswer(
    'Para proporcionarte un presupuesto de Servicio de higiene y seguridad, necesito la siguiente información:'
  )
  .addAnswer('¿Cuál es el rubro de la empresa?', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "rubro": ctx.body });
      }
  )
  .addAnswer('¿Cuántos empleados tiene la empresa?', { capture: true },
    async (ctx, ctxFn) => {
        await ctxFn.state.update({ "empleados": ctx.body });
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
      const rubro = ctxFn.state.get("rubro");
      const empleados = ctxFn.state.get("empleados");
      const empresa = ctxFn.state.get("empresa");
      const nombre = ctxFn.state.get("nombre");
      const email = ctxFn.state.get("email");
      const telefono = ctxFn.state.get("telefono");    
    
    const mailContent = `
    Se ha recibido una solicitud de presupuesto para un Servicio de Higiene y Seguridad con los siguientes detalles:
    - Nombre: ${nombre}
    - Empresa: ${empresa}
    - Email: ${email}
    - Teléfono: ${telefono}
    - Rubro de la empresa: ${rubro}
    - Cantidad de empleados: ${empleados}
  `;

    await sendMail({
      to: DEST_EMAIL,
      subject: 'Solicitud de Presupuesto para Servicio de Higiene y Seguridad',
      text: mailContent
    });
        // --- Bloquear al usuario tras completar el formulario ---
        await mongoAdapter.blockUser(ctx.from);
  
        // Finalizar flujo para usuario bloqueado
        return ctxFn.endFlow();
  
    }
  );