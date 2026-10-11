# Investigación y decisiones: Temporada, calendario y campeonato

**Fase 0** · 2026-10-10

## D1. Trazados reales en vez de generados

- **Decisión**: los 20 circuitos usan trazas GPS reales (OpenStreetMap vía bacinger/f1-circuits), convertidas una vez con una herramienta del repo; los números de juego (vueltas, desgaste, boxes, dificultad) son perfiles a mano con valores cuasi reales.
- **Por qué**: Rafa conoce los circuitos de verdad: que Mónaco parezca Mónaco vale más que cualquier generador; y los datos dentro del repo mantienen el offline (III: cero dependencia en runtime).
- **Alternativas descartadas**: generador procedural (fase previa del plan; desechado cuando apareció la fuente de trazados reales); dibujar a mano (inviable).

## D2. Personalidad por circuito en cuatro números

- **Decisión**: cada circuito define vueltas, factor de desgaste de gomas, pérdida en boxes y dificultad de adelantamiento (derivada de lo trabado del trazado: Mónaco 0,87 vs Monza 0,35).
- **Por qué**: son las cuatro palancas que cambian la estrategia entre GPs (cuándo parar, si vale undercut, si adelantar es caro); cuatro números se leen de un vistazo.
- **Alternativas descartadas**: física por sectores (alcance desmedido); circuitos solo visuales (sin efecto estratégico).

## D3. Ids estables para que el calendario viva

- **Decisión**: los circuitos se generan deterministas con ids fijos (`track-N` por posición en la lista); el calendario guarda ids.
- **Por qué**: cambiar un circuito de sitio rompería los resultados guardados ("R3 era Bakú"); la estabilidad hace que el guardado sobreviva a versiones.
- **Alternativas descartadas**: regenerar circuitos por temporada (rompe el historial); ids aleatorios (innecesario).

## D4. Puntos de F1 y tablas acumuladas

- **Decisión**: puntuación estándar 25-18-15-12-10-8-6-4-2-1 (0 desde el 11º); cada carrera guarda los puntos de los 20 pilotos; las tablas de pilotos y constructores se recalculan sumando los resultados de la temporada.
- **Por qué**: es el reglamento que cualquier aficionado conoce; guardar los puntos por carrera (y no solo los acumulados) hace las tablas recomputables y a prueba de guardados raros.
- **Alternativas descartadas**: solo guardar acumulados (un guardado tocado descarrila la tabla); medias posiciones (raro).

## D5. El calendario avanza al terminar, nunca hacia atrás

- **Decisión**: el índice de ronda sube una vez por carrera registrada; la última ronda no sube y activa el resumen; repetir una carrera ya registrada no vuelve a subir (guardia de la spec 004); temporada completa cambia el botón a "Ver temporada".
- **Por qué**: el progreso no puede desfasarse con los resultados (más resultados que rondas) ni bloquearse (menos).
- **Alternativas descartadas**: elegir GP libremente (la temporada pierde el sentido); avanzar al pulsar (no al cobrar: desincroniza con la economía).

## D6. Temporada nueva = año siguiente, no borrado

- **Decisión**: "Empezar temporada nueva" sube el número de temporada, vacía resultados y calendario; conserva presupuesto, mejoras del coche, sede y patrocinadores.
- **Por qué**: el bucle largo del juego de gestión es "año a año, el equipo mejora"; borrar el progreso sería castigar al que termina la temporada.
- **Alternativas descartadas**: fin del juego con pantallas de récord (premature); conservar también los resultados (las tablas serían acumuladas de por vida, no de temporada).

## D7. Resumen con celebración, sin librerías

- **Decisión**: el total de premios sube animado (~1,6 s, desaceleración suave) con animación propia por fotogramas.
- **Por qué**: el cierre del año merece un momento; y hacerlo a mano mantiene (III).
- **Alternativas descartadas**: número seco (antiermozo); librería de animación (innecesaria).
