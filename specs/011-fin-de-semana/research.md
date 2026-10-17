# Investigación y decisiones: Formato de fin de semana

**Fase 0** · 2026-10-11

## D1. Cuatro carreras del mismo motor, no cuatro modos

- **Decisión**: cada evento es una carrera normal con menos vueltas y parrilla inicial dada; ni un modo nuevo en el motor.
- **Por qué**: el motor ya sabe correr; clasificación = minicarrera a 3 vueltas; sprints = cuarto de distancia. Cero riesgo de regresión y el jugador usa lo que ya conoce (pausa, velocidades, boxes).
- **Alternativas descartadas**: clasificación por vuelta cronometrada sin carrera (motor nuevo, sin espectáculo); sprints con reglas distintas (más código, más confusión).

## D2. La parrilla se reconstruye de los resultados, no de memoria

- **Decisión**: no hay campo "estado de fin de semana": el evento pendiente y la parrilla se derivan de los resultados registrados (standings guardados en orden de clasificación).
- **Por qué**: sin estado duplicado no hay desincronización: cerrar la app a mitad de fin de semana y volver reconstruye exactamente lo pendiente; la guardia anti-repetición por (ronda, evento) cae gratis.
- **Alternativas descartadas**: guardar parrillas y evento en curso (estado redundante que puede contradecir los resultados).

## D3. Sprints: cuarta parte de premios, puntos top 8

- **Decisión**: premios = tabla × 0,25 redondeada; puntos 8-7-6-5-4-3-2-1.
- **Por qué**: la decisión de Rafa ("todo puntúa") con proporción real de sprint F1: el sprint importa pero la carrera pesa el triple en dinero y más en puntos; un fin de semana completo paga ~1,5 carreras viejas, lo que compensa el mercado más caro de la spec 009.
- **Alternativas descartadas**: premios completos en todo (economía disparatada: 4× ingresos); sprints sin dinero (no duelen).

## D4. Las bills del fin de semana, en la carrera

- **Decisión**: patrocinio y gastos fijos se liquidan una sola vez, al terminar la carrera, con su desglose en el panel.
- **Por qué**: cobrarlos 4 veces cuadruplicaría los gastos (o habría que dividirlos, más confuso); la carrera es el acto que "cierra caja" del fin de semana.
- **Alternativas descartadas**: liquidar por evento (4× gastos: insostenible); dividir en cuartos (desglose ilegible).

## D5. La temporada la completan las carreras

- **Decisión**: `isSeasonComplete` cuenta resultados con evento = carrera (24); los sprints nunca la cierran.
- **Por qué**: salir de Mónaco con el sprint ganado no puede saltar el resumen de temporada con la carrera sin correr.
- **Alternativas descartadas**: contar cualquier evento (temporada completable sin correr 24 carreras).

## D6. Clima sorteado por evento

- **Decisión**: cada evento sortea su riesgo de lluvia (carrera el global; clasificación y sprints, el 40 % de él).
- **Por qué**: eventos cortos con menos probabilidad (menos segundos de carrera = menos ventana de lluvia); y drama posible: sprint en mojado y carrera en seco.
- **Alternativas descartadas**: un clima por fin de semana (menos variedad, más estado).
