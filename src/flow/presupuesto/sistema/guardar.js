import { addKeyword, EVENTS } from "@builderbot/bot";
import { appendToSheet } from "../../../services/sheets/index.js";
import { sendMail } from "../../../services/mail/index.js";

const SHEET_NAME = 'Sistema de autoprotección';
const DEST_EMAIL = 'consultoraexcon@gmail.com';

export const flowGuardarDatos = addKeyword(EVENTS.ACTION)
.addAction(async (_, { state }) => {
  await state.update({ menuActual: 'presupuestos' });
})  
.addAnswer(
  'Tu solicitud ha sido procesada con éxito. Pronto se pondrán en contacto contigo para brindarte más información. ¡Gracias!', null, 
  async (ctx, ctxFn) => {
    const actividad = ctxFn.state.get("actividad");
    const superficie = ctxFn.state.get("superficie");
    const subsuelos = ctxFn.state.get("subsuelos");
    const pisos = ctxFn.state.get("pisos");
    const grupo = ctxFn.state.get("grupo");
    const planosCAD = ctxFn.state.get("planosCAD");
    const planosPapel = ctxFn.state.get("planosPapel");
    const empresa = ctxFn.state.get("empresa");
    const empleados = ctxFn.state.get("empleados");
    const nombre = ctxFn.state.get("nombre");
    const email = ctxFn.state.get("email");
    const telefono = ctxFn.state.get("telefono");
    await appendToSheet(SHEET_NAME, [actividad, superficie, subsuelos, pisos, grupo, planosCAD, planosPapel, empleados, empresa, nombre, email, telefono]);
  
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

  
  }
);

export default flowGuardarDatos;