import { addKeyword, EVENTS } from "@builderbot/bot";
import { sendMail } from "../../services/mail/index.js";
import { mongoAdapter } from "../../db/index.js";  // Importar para bloqueo

const DEST_EMAIL = 'consultoraexcon@gmail.com';

export default addKeyword(EVENTS.ACTION)
  .addAction(async (_, { state }) => {
    await state.update({ menuActual: 'presupuestos' });
  })
  .addAnswer(
    'Para proporcionarte un presupuesto de asistencia profesional, necesito la siguiente información:'
  )
  .addAnswer('¿Tienen los planos de AutoCAD actualizados?', { capture: true },
    async (ctx, ctxFn) => {
      await ctxFn.state.update({ menuActual: 'presupuestos' });
      await ctxFn.state.update({ planos: ctx.body });
    }
  )
  .addAnswer('¿Cuál es la superficie del lugar?', { capture: true },
    async (ctx, ctxFn) => {
      await ctxFn.state.update({ superficie: ctx.body });
    }
  )
  .addAnswer('Finalmente, necesito la siguiente información de contacto:')
  .addAnswer('Por favor, proporciona tu nombre:', { capture: true },
    async (ctx, ctxFn) => {
      await ctxFn.state.update({ nombre: ctx.body });
    }
  )
  .addAnswer('Proporciona tu email:', { capture: true },
    async (ctx, ctxFn) => {
      await ctxFn.state.update({ email: ctx.body });
    }
  )
  .addAnswer('Finalmente, tu teléfono:', { capture: true },
    async (ctx, ctxFn) => {
      await ctxFn.state.update({ telefono: ctx.body });
    }
  )
  .addAnswer(
    'Tu solicitud ha sido procesada con éxito. Pronto se pondrán en contacto contigo para brindarte más información. ¡Gracias!',
    null,
    async (ctx, ctxFn) => {
      // Recuperar datos del estado
      const planos = await ctxFn.state.get('planos');
      const superficie = await ctxFn.state.get('superficie');
      const nombre = await ctxFn.state.get('nombre');
      const email = await ctxFn.state.get('email');
      const telefono = await ctxFn.state.get('telefono');

      // Enviar mail de notificación
      const mailContent = `
Se ha recibido una solicitud de presupuesto para una Asistencia Profesional con los siguientes detalles:
- Nombre: ${nombre}
- Email: ${email}
- Teléfono: ${telefono}
- ¿Tienen los planos en AutoCAD actualizados?: ${planos}
- Superficie del lugar: ${superficie}
      `;

      await sendMail({
        to: DEST_EMAIL,
        subject: 'Solicitud de Presupuesto para Asistencia Profesional',
        text: mailContent
      });

      // --- Bloquear al usuario tras completar el formulario ---
      await mongoAdapter.blockUser(ctx.from);

      // Finalizar flujo para usuario bloqueado
      return ctxFn.endFlow();
    }
  );
