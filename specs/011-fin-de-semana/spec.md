# Especificación de la función: Formato de fin de semana

**Rama de la función**: `011-fin-de-semana`

**Creada**: 2026-10-11

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Añadir formato de fin de semana (Sprint 1 y 2, clasificación, y carrera)." Decisión de Rafa (2026-10-11): todo puntúa — clasificación → Sprint 1 → Sprint 2 → Carrera, cada resultado ordena la salida del siguiente; sprints con puntos reducidos (top 8: 8-7-6-5-4-3-2-1) y premios del 25 %; solo la carrera paga a escala completa y liquida los gastos del fin de semana.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Un fin de semana con cuatro actos (Prioridad: P1)

Como jugador quiero que cada ronda sea un fin de semana entero —clasificación, dos sprints y la carrera— con cada salida ordenada por el resultado anterior, para que una ronda sea una historia y no un disparo.

**Por qué esta prioridad**: es la estructura de todo lo demás: calendario, economía y campeonato laten por rondas.

**Prueba independiente**: entrar en la R1: se corre la clasificación; su resultado ordena el Sprint 1; este, el Sprint 2; y este, la carrera.

**Escenarios de aceptación**:

1. **Dado** el inicio de una ronda, **cuando** pulso el botón, **entonces** entro en la clasificación: corta (unas pocas de vueltas), sin puntos ni premios, y decide la salida del Sprint 1.
2. **Dado** la clasificación terminada, **cuando** continúo, **entonces** entro en el Sprint 1 con la parrilla de la clasificación, a un cuarto de la distancia de la carrera.
3. **Dado** el Sprint 1 terminado, **cuando** continúo, **entonces** el Sprint 2 sale ordenado por el Sprint 1 (misma distancia).
4. **Dado** el Sprint 2 terminado, **cuando** continúo, **entonces** la carrera sale ordenada por el Sprint 2, a distancia completa.
5. **Dado** un evento terminado y guardado, **cuando** salgo a Mi Equipo y vuelvo, **entonces** el botón me devuelve al evento pendiente (con su parrilla reconstruida): el fin de semana se reanuda, no se repite.

---

### Historia de usuario 2 - Los sprints puntúan (a su manera) (Prioridad: P1)

Como jugador quiero que los sprints den puntos y dinero de verdad (menos que la carrera, pero que duelan), para que importen cómo se corren y no sean trámite.

**Por qué esta prioridad**: "todo puntúa" fue la decisión: sin recompensa, los sprints serían pintura.

**Prueba independiente**: terminar un sprint: los 8 primeros cobran puntos (8-7-6…-1), los premios del panel son la cuarta parte de la tabla, y el campeonato los suma.

**Escenarios de aceptación**:

1. **Dado** un sprint terminado, **cuando** se registra, **entonces** los 8 primeros suman puntos (8 al ganador… 1 al octavo; nada del noveno atrás) y las tablas de campeonato los acumulan junto a los de la carrera.
2. **Dado** un sprint terminado, **cuando** miro el panel, **entonces** los premios de mis coches son la cuarta parte de la tabla de la carrera, y el presupuesto sube por ello.
3. **Dado** la carrera terminada, **cuando** se liquida el fin de semana, **entonces** los premios de la carrera son a escala completa y se cobran (una sola vez) el patrocinio y los gastos fijos del fin de semana.
4. **Dado** la clasificación terminada, **cuando** miro el panel, **entonces** no cobra nada: ordenar la parrilla es su premio.

---

### Historia de usuario 3 - La temporada respira con el nuevo ritmo (Prioridad: P2)

Como jugador quiero que temporada, historial y desbloqueos entiendan los cuatro eventos, para que nada se descuadere.

**Por qué esta prioridad**: es la integridad del sistema; sin ella, el formato rompe más de lo que aporta.

**Prueba independiente**: el historial de temporada lista las rondas con sus cuatro actos y el total suma; los desbloqueos de patrocinador usan el mejor resultado de cualquier evento.

**Escenarios de aceptación**:

1. **Dado** el historial de temporada, **cuando** miro una ronda, **entonces** veo sus cuatro actos con su mejor puesto y su premio, y el total del año suma todos los premios.
2. **Dado** mis resultados de cualquier evento (incluidos sprints), **cuando** mejoro mi mejor puesto, **entonces** los patrocinadores se desbloquean con él.
3. **Dado** la ronda 24 con su carrera terminada, **cuando** termina, **entonces** la temporada se da por completada (la completan las CARRERAS, no los eventos a medias) y llega el resumen.
4. **Dado** una partida de antes del cambio, **cuando** migra, **entonces** sus resultados cuentan como carreras y su ronda en curso empieza por la clasificación.

---

### Casos límite

- ¿Repetir un evento ya registrado? No se puede entrar: el botón siempre ofrece el pendiente; y la guardia anti-repetición impide cobrar dos veces (spec 004).
- ¿Salir a mitad de evento (sin terminar)? El evento no cuenta: al volver, se vuelve a correr entero desde su parrilla.
- ¿Abandonos en clasificación/sprint? El orden de llegada (con los fuera al final por progreso) ordena el siguiente evento: todos tienen parrilla.
- ¿Sprint de circuito corto (p. ej. Nürburgring a 24 vueltas → 6)? La distancia de sprint nunca baja de 3 vueltas.
- ¿Bills sin carrera? Si el jugador no termina la carrera, el fin de semana no liquida patrocinio/gastos: se cobran al terminar la carrera, no antes.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: Cada ronda DEBE desarrollarse en cuatro eventos jugables en orden: clasificación (corta, sin puntos ni premios), Sprint 1, Sprint 2 (a un cuarto de la distancia de la carrera) y carrera (distancia completa).
- **FR-002**: Cada evento DEBE ordenar la parrilla del siguiente con su clasificación final; la clasificación ordena por ritmo esperado; la reconstrucción al reanudar DEBE ser idéntica a la del momento.
- **FR-003**: Los sprints DEBEN puntuar a los 8 primeros (8-7-6-5-4-3-2-1) y pagar premios a la cuarta parte de la tabla de carrera; la carrera puntúa y paga a escala completa; la clasificación, ni puntos ni premios.
- **FR-004**: El patrocinio y los gastos fijos DEBEN liquidarse una sola vez por fin de semana, al terminar la carrera, con su desglose en el panel.
- **FR-005**: Campeonato, historial de temporada y desbloqueo de patrocinadores DEBEN acumular/usar los resultados de TODOS los eventos del fin de semana.
- **FR-006**: La temporada DEBE completarse cuando las 24 CARRERAS están registradas; el botón de entrada DEBE mostrar siempre el evento pendiente de la ronda en curso.
- **FR-007**: Las partidas guardadas DEBEN migrar: los resultados sin evento cuentan como carreras y la ronda en curso empieza en clasificación.

### Entidades clave

- **Evento del fin de semana**: clasificación, Sprint 1, Sprint 2 o carrera, con su distancia, parrilla, puntos y premios propios.
- **Resultado de temporada** (spec 005): gana el evento al que pertenece; la parrilla del siguiente se reconstruye de él.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: Completar una ronda entera son exactamente 4 eventos con parrillas encadenadas (la salida de cada uno coincide con la clasificación del anterior).
- **SC-002**: Un sprint con dos coches en el top 8 suma exactamente sus puntos sprint a las tablas y la cuarta parte de premios al presupuesto; la carrera los de escala completa.
- **SC-003**: El fin de semana liquida patrocinio y gastos una sola vez (en la carrera), y el historial muestra los cuatro actos con total correcto.

## Supuestos

- La clasificación se corre como minicarrera de 3 vueltas (mismo motor y pantalla): "todo se juega" fue la esencia de la decisión.
- El clima se sortea por evento (menos probable en los cortos): puede llover en un sprint y no en la carrera.
- Los números exactos (vueltas de clasificación, factor de premio sprint, puntos sprint) viven en el plan.
