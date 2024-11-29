function generarPrompt(actividad, superficie, subsuelos, pisos) {
  return `
Determina a qué grupo pertenece la empresa en función de su categoría, cantidad de pisos, subsuelos y superficie. Responde únicamente con el número del grupo (Grupo 1, Grupo 2, Grupo 3). No proporciones ninguna otra información adicional. Si la información es insuficiente, responde con "Información insuficiente" para indicar que falta información específica.

------
INFORMACIÓN_PROPORCIONADA:
- Actividad: ${actividad}
- Superficie: ${superficie} m²
- Subsuelos: ${subsuelos}
- Pisos: ${pisos}

------

INSTRUCCIONES PARA LA CLASIFICACIÓN:
- La clasificación debe basarse en la siguiente información: la actividad principal de la empresa, la cantidad de metros cuadrados de superficie cubierta, el número de subsuelos y el número de pisos.
- Si la información proporcionada es insuficiente o no puedes realizar una clasificación precisa, responde exactamente con "Información insuficiente". 
- No especules ni inventes respuestas. Asegúrate de que toda la información proporcionada sea suficiente para clasificar el grupo.

DIRECTRICES PARA LA RESPUESTA:
- Responde solamente con "Grupo 1", "Grupo 2", o "Grupo 3".
- Si falta información o no se puede realizar una clasificación precisa, responde exactamente con "Información insuficiente".
- No agregues ningún tipo de explicación adicional ni detalles sobre la clasificación. 



Categorías y criterios de clasificación:

1. Administración / Oficinas:
 - Grupo 1: Superficie menor a 500 m²
 - Grupo 2: Superficie entre 501 y 1000 m²
 - Grupo 3: Superficie mayor a 1000 m²

2. Actividades Especiales:
 - Grupo 2: Superficie menor a 600 m²
 - Grupo 3: Superficie mayor a 600 m²

3. Sanitario:
 - Grupo 1: Únicamente con planta baja y superficie menor a 300 m²
 - Grupo 2: Menos de 3 pisos y superficie entre 301 y 1500 m²
 - Grupo 3: Más de 4 pisos y superficie mayor a 1500 m²

4. Espectáculos y Diversiones:
 - Grupo 2: 1 piso y superficie menor a 600 m²
 - Grupo 3: Más de 2 pisos y superficie mayor a 1000 m²

5. Televisión:
 - Grupo 1: Únicamente planta baja, sin subsuelos y menor a 500 m²
 - Grupo 2: Sin subsuelos y superficie entre 500 y 1000 m²
 - Grupo 3: Con subsuelos y superficie mayor a 1000 m²

6. Estadios:
 - Grupo 3: Todos los casos

7. Locales Bailables:
 - Grupo 3: Todos los casos

8. Centros y Salones de Exposiciones:
 - Grupo 2: 1 piso y superficie menor a 1000 m²
 - Grupo 3: Más de 2 pisos o con subsuelos y superficie mayor a 1000 m²

9. Salas de Juego:
 - Grupo 1: Sin subsuelos y superficie menor a 500 m²
 - Grupo 2: Sin subsuelos y superficie entre 500 y 1000 m²
 - Grupo 3: Con subsuelos y superficie mayor a 1000 m²

10. Circo Rodante:
  - Grupo 3: Todos los casos

11. Clubes y Locales para Práctica de Deportes:
  - Grupo 1: Superficie menor a 500 m²
  - Grupo 2: Superficie entre 500 y 1500 m²
  - Grupo 3: Superficie mayor a 1500 m²

12. Predios para Entretenimientos y Prácticas Deportivas:
  - Grupo 1: Superficie menor a 500 m²
  - Grupo 2: Superficie entre 500 y 1000 m²
  - Grupo 3: Superficie mayor a 1000 m²

13. Club Social, Cultural y Deportivo Cubierto:
  - Grupo 1: Superficie menor a 500 m²
  - Grupo 2: Superficie entre 500 y 1000 m²
  - Grupo 3: Superficie mayor a 1000 m²

14. Club Deportivo al Aire Libre:
  - Grupo 1: Superficie menor a 500 m²
  - Grupo 2: Superficie entre 500 y 1000 m²
  - Grupo 3: Superficie mayor a 1000 m²

15. Casa de Fiestas Privadas:
  - Grupo 1: Sin subsuelos y superficie menor a 300 m²
  - Grupo 2: Sin subsuelos y superficie entre 300 y 1000 m²
  - Grupo 3: Más de 4 pisos, con subsuelos y superficie mayor a 1000 m²

16. Casa de Fiestas Privadas Infantiles:
  - Grupo 2: Sin subsuelos, hasta 2 pisos y superficie menor a 700 m²
  - Grupo 3: Superficie mayor a 700 m², con subsuelos y más de 3 pisos

17. Bares, Restaurantes y Cantinas:
  - Grupo 1: Sin subsuelos y superficie menor a 500 m²
  - Grupo 2: Sin subsuelos y superficie entre 500 y 1000 m²
  - Grupo 3: Con subsuelos y superficie mayor a 1000 m²

18. Usos Culturales - Club de Música en Vivo:
  - Grupo 2: Sin subsuelos y superficie menor a 500 m²
  - Grupo 3: Con subsuelos, más de 1 piso y superficie mayor a 500 m²

19. Usos Culturales - Espacio Cultural Independiente (Ley 6063 Art 34):
  - Grupo 1: Superficie menor a 300 m²
  - Grupo 2: Superficie menor a 500 m² y sin subsuelo
  - Grupo 3: Superficie mayor a 500 m² y con subsuelos

20. Otros Usos Culturales:
  - Grupo 1: Sin subsuelos y superficie menor a 500 m²
  - Grupo 2: Superficie entre 500 y 700 m² y sin subsuelos
  - Grupo 3: Superficie mayor a 700 m² con subsuelos

21. Locales Comerciales:
  - Grupo 1: Superficie menor a 500 m²
  - Grupo 2: Superficie entre 500 y 1000 m²
  - Grupo 3: Superficie mayor a 1000 m²

22. Bancos:
  - Grupo 1: Superficie menor a 300 m²
  - Grupo 2: Superficie entre 300 y 1500 m² con hasta 1 subsuelo o hasta 3 pisos
  - Grupo 3: Superficie mayor a 1500 m² con más de 1 subsuelo o más de 4 pisos

23. Hotel – Alojamiento – Hospedaje:
  - Grupo 2: Superficie menor a 1500 m² y con más de 3 pisos o 1 subsuelo
  - Grupo 3: Superficie mayor a 1500 m² y a partir de 4 pisos o 2 subsuelos

24. Galería Comercial / Shopping:
  - Grupo 1: Superficie menor a 1000 m²
  - Grupo 2: Superficie entre 1000 y 2000 m²
  - Grupo 3: Superficie mayor a 2000 m²

25. Escuelas e Instituciones Educativas:
  - Grupo 1: Superficie menor a 1500 m²
  - Grupo 2: Superficie entre 1500 y 3000 m²
  - Grupo 3: Superficie mayor a 3000 m²

26. Jardín de Infantes, Escuela Infantil, Jardín Maternal:
  - Grupo 1: Superficie menor a 1000 m²
  - Grupo 2: Superficie entre 1000 y 2000 m²
  - Grupo 3: Superficie mayor a 2000 m²

27. Garages / Estacionamientos (superficie cubierta):
  - Grupo 1: Superficie menor a 500 m²
  - Grupo 2: Superficie entre 500 y 1000 m²
  - Grupo 3: Superficie mayor a 1000 m²

28. Garages / Estacionamientos (superficie descubierta):
  - Grupo 1: Superficie menor a 1500 m²
  - Grupo 2: Superficie entre 1500 y 5000 m²
  - Grupo 3: Superficie mayor a 5000 m²

29. Estación de Servicio:
  - Grupo 1: Superficie menor a 500 m²
  - Grupo 2: Superficie entre 500 y 1000 m²
  - Grupo 3: Superficie mayor a 1000 m²

30. Taller Mecánico / Pintura / Service Automotor:
  - Grupo 1: Sin subsuelos y superficie menor a 500 m²
  - Grupo 2: Sin subsuelos y superficie entre 500 y 1000 m²
  - Grupo 3: Con subsuelos y superficie mayor a 1000 m²

31. Depósito:
  - Grupo 1: Superficie menor a 1000 m²
  - Grupo 2: Superficie entre 1000 y 2000 m²
  - Grupo 3: Superficie mayor a 2000 m²

32. Industrias:
  - Grupo 1: Superficie menor a 1000 m²
  - Grupo 2: Superficie entre 1000 y 2000 m²
  - Grupo 3: Superficie mayor a 2000 m²

33. Actividades Religiosas:
  - Grupo 1: Superficie menor a 500 m²
  - Grupo 2: Superficie entre 500 y 1500 m²
  - Grupo 3: Superficie mayor a 1500 m²

34. Actividades Culturales:
  - Grupo 1: Superficie menor a 500 m²
  - Grupo 2: Superficie entre 500 y 1500 m²
  - Grupo 3: Superficie mayor a 1500 m²

35. Geriátricos y Asilos:
  - Grupo 1: Superficie menor a 600 m²
  - Grupo 2: Superficie entre 600 y 1500 m²
  - Grupo 3: Superficie mayor a 1500 m²

36. Residencia para Personas Mayores que Requieren Asistencia:
  - Grupo 1: Superficie menor a 600 m²
  - Grupo 2: Superficie entre 600 y 1500 m²
  - Grupo 3: Superficie mayor a 1500 m²

37. Hogares, Residencias:
  - Grupo 1: Superficie menor a 600 m²
  - Grupo 2: Superficie entre 600 y 1500 m²
  - Grupo 3: Superficie mayor a 1500 m²

38. Hogar de Niños:
  - Grupo 1: Superficie menor a 600 m²
  - Grupo 2: Superficie entre 600 y 1500 m²
  - Grupo 3: Superficie mayor a 1500 m²

39. Refugios Nocturnos:
  - Grupo 3: Todos los casos

40. Transporte Público:
  - Grupo 3: Todos los casos

41. Penitenciaría y Lugares de Detención:
  - Grupo 3: Todos los casos
`;
}
export default generarPrompt;