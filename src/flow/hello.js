import { addKeyword } from "@builderbot/bot";

export const helloFlow = addKeyword(['hola', 'buenas'])
    .addAnswer('Bienvenido al asistente virtual de la *Consultora Integral Excon*')
    .addAnswer('¿Como puedo ayudarte el día de hoy 😀?')
