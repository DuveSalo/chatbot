--- START OF FILE flow/presupuesto/sistema/guardar.js ---

import { addKeyword, EVENTS } from "@builderbot/bot";
import { appendToSheet } from "../../../services/sheets/index.js";
import { sendMail } from "../../../services/mail/index.js";
import { mongoAdapter } from "../../../db/index.js";

const SHEET_NAME = 'Sistema de autoprotección';
const DEST_EMAIL = 'consultoraexcon@gmail.com';

export const flowGuardarDatos = addKeyword(EVENTS.ACTION)
.addAction(async (_, { state }) => {
  await state.update({ menuActual: 'presupuestos' });
})  
.addAnswer(
  'Tu solicitud ha sido procesada con éxito. Pronto se pondrán en contacto contigo para brindarte más información. ¡Gracias!', 
  null, 
  async (ctx, ctxFn) => {
    const actividad = await ctxFn.state.get("actividad");
    const superficie = await ctxFn.state.get("superficie");
    const subsuelos = await ctxFn.state.get("subsuelos");
    const pisos = await ctxFn.state.get("pisos");
    const grupo = await ctxFn.state.get("grupo");
    const planosCAD = await ctxFn.state.get("planosCAD");
    // <<< MEJORA: Si 'planosPapel' no se estableció, se asigna un valor por defecto.
    const planosPapel = (await ctxFn.state.get("planosPapel")) || 'No aplica'; 
    const empresa = await ctxFn.state.get("empresa");
    const empleados = await ctxFn.state.get("empleados");
    const nombre = await ctxFn.state.get("nombre");
    const email = await ctxFn.state.get("email");
    const telefono = await ctxFn.state.get("telefono");

    await appendToSheet(SHEET_NAME, [
        actividad, 
        superficie, 
        subsuelos, 
        pisos, 
        grupo, 
        planosCAD, 
        planosPapel, 
        empleados, 
        empresa, 
        nombre, 
        email, 
        telefono
    ]);
  
  const mailContent = `
  Se ha recibido una solicitud de presupuesto para un Sistema de Autoprotección con los siguientes detalles:
  - Nombre: ${nombre}
  - Email: ${email}
  - Teléfono: ${telefono}
  - Empresa: ${empresa}
  - Actividad: ${actividad}
  - Superficie: ${superficie}
  - Subsuelos: ${subsuelos}
  - Pisos: ${pisos}
  - Grupo: ${grupo}
  - Planos en CAD: ${planosCAD}
  - Planos en papel: ${planosPapel}
  - Cantidad de empleados: ${empleados}
        `;

  await sendMail({
    to: DEST_EMAIL,
    subject: 'Solicitud de Presupuesto para Sistema de Autoprotección',
    text: mailContent
  });
    
  // --- Bloquear al usuario tras completar el formulario ---
      await mongoAdapter.blockUser(ctx.from);

      // Finalizar flujo para usuario bloqueado
      return ctxFn.endFlow();
  }
);

export default flowGuardarDatos;
