# Especificación de la función: Temporada, calendario y campeonato

**Rama de la función**: `005-temporada-campeonato`

**Creada**: 2026-10-10

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Una temporada de 20 grandes premios en circuitos con trazados reales, un calendario que avanza solo, campeonatos de pilotos y constructores con puntos de F1, y al final un resumen con botón de temporada nueva que conserva mi dinero y mis mejoras." Especificación retrospectiva (Fases 5 y 6 del desarrollo + campeonato de la fase 7).

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Veinte circuitos que se reconocen (Prioridad: P1)

Como jugador quiero correr en 20 circuitos distintos basados en trazados reales, cada uno con su personalidad (vueltas, desgaste, boxes, dificultad de adelantamiento), para que la temporada sea un viaje y no la misma pista veinte veces.

**Por qué esta prioridad**: es el escenario del juego: sin variedad de circuitos, la temporada es una repetición.

**Prueba independiente**: la tabla de circuitos (`npm run tracks`): 20 GPs con nombres reconocibles y números distintos en cada columna.

**Escenarios de aceptación**:

1. **Dado** el calendario, **cuando** lo recorro, **entonces** hay 20 rondas en un orden fijo, de la apertura al cierre.
2. **Dado** un circuito, **cuando** entro en su carrera, **entonces** su trazado se parece al real (Mónaco estrecho y tortuoso, Monza rabioso) y su número de vueltas y desgaste son los suyos.
3. **Dado** dos circuitos distintos, **cuando** los comparo, **entonces** uno castiga más las gomas, otro pierde más tiempo en boxes o adelanta peor: la estrategia cambia por circuito.
4. **Dado** una misma partida, **cuando** vuelvo a entrar, **entonces** el calendario es el mismo (los circuitos no se regeneran): mis resultados pasados siguen refiriéndose a su circuito.

---

### Historia de usuario 2 - El calendario avanza solo (Prioridad: P1)

Como jugador quiero que el botón de carrera me lleve siempre al GP que toca y que, al terminarlo, el siguiente esté esperando, para no llevar cuentas.

**Por qué esta prioridad**: el progreso es el hilo que tira del juego; si hay que apuntar la ronda a mano, se rompe.

**Prueba independiente**: terminar un GP: el botón pasa de "R1: …" a "R2: …" y el panel de resultados anuncia el siguiente.

**Escenarios de aceptación**:

1. **Dado** el botón de carrera, **cuando** miro su texto, **entonces** dice la ronda actual y el circuito que toca.
2. **Dado** un GP terminado y cobrado, **cuando** vuelvo a Mi Equipo, **entonces** el botón apunta al siguiente GP.
3. **Dado** el último GP de la temporada terminado, **cuando** termina, **entonces** el calendario no avanza más, el panel anuncia "Temporada completada" y aparece el acceso al resumen de temporada.
4. **Dado** la temporada completada, **cuando** miro el botón de carrera, **entonces** se ha convertido en "Ver temporada": no hay carrera 21.
5. **Dado** un GP ya registrado esta temporada, **cuando** se repite, **entonces** no se registra dos veces y el calendario no se descompasa (spec 004).

---

### Historia de usuario 3 - Campeonatos que se llenan solos (Prioridad: P2)

Como jugador quiero las tablas de pilotos y constructores de la temporada, con la puntuación de la F1 y mi equipo destacado, para saber dónde estoy en el año.

**Por qué esta prioridad**: da sentido de temporada a las carreras sueltas; sin campeonato, cada carrera es un amistoso.

**Prueba independiente**: tras dos carreras, la pestaña Campeonato suma los puntos de ambas en ambas tablas.

**Escenarios de aceptación**:

1. **Dado** una carrera terminada, **cuando** se registra, **entonces** cada uno de los 20 pilotos cobra sus puntos según su puesto (25 al primero… 1 al décimo, nada desde el 11º).
2. **Dado** varias carreras, **cuando** abro "Campeonato", **entonces** pilotos y constructores acumulan y ordenan por puntos, con mi equipo resaltado y el color de cada escudería.
3. **Dado** la temporada sin carreras, **cuando** abro "Campeonato", **entonces** la pantalla explica qué hacer (correr carreras) en lugar de salir vacía.
4. **Dado** la tabla de pilotos, **cuando** miro un nombre, **entonces** veo de qué equipo es.

---

### Historia de usuario 4 - Fin de año y temporada nueva (Prioridad: P3)

Como jugador quiero, al acabar las 20 rondas, un resumen del año (cada carrera, mi mejor puesto, el premio) con el total ganado, y un botón que empiece la temporada siguiente conservando el dinero y las mejoras, para que el juego no se acabe.

**Por qué esta prioridad**: cierra el bucle largo; sin él, el juego termina con la temporada.

**Prueba independiente**: completar la temporada: el resumen lista las 20 rondas y el contador sube hasta el total; "Empezar temporada nueva" deja el calendario a R1 con el presupuesto intacto.

**Escenarios de aceptación**:

1. **Dado** la temporada completada, **cuando** abro el resumen, **entonces** lista las 20 rondas con circuito, mi mejor puesto de cada una y su premio, y el total de premios del año con el presupuesto resultante.
2. **Dado** el resumen abierto, **cuando** miro el total, **entonces** sube animado hasta la cifra final (celebración).
3. **Dado** "Empezar temporada nueva", **cuando** lo pulso, **entonces** la temporada pasa a la número siguiente, el calendario y los resultados se ponen a cero, y el presupuesto, las mejoras del coche, la sede y los patrocinadores siguen donde estaban.
4. **Dado** la temporada nueva empezada, **cuando** miro "Campeonato", **entonces** las tablas están a cero: el campeonato es por temporada.

---

### Casos límite

- ¿Entrar al botón de carrera con la temporada ya completa? No hay carrera: lleva al resumen.
- ¿Repetir la última carrera? No cobra doble ni avanza el índice (guardia de la spec 004); el botón de temporada ya está disponible.
- ¿Resumen con temporada incompleta? El título lo dice ("resumen parcial") y lista lo que hay; si no hay carreras, avisa de ello.
- ¿Circuito del calendario desaparecido (guardado raro)? La carrera cae al primero del calendario en lugar de romper.
- ¿Empates a puntos? El orden de tabla los deja en el orden de llegada (estable dentro de la temporada); no hay desempates finos.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El juego DEBE ofrecer una temporada de 20 circuitos basados en trazados reales, cada uno con nombre propio y números propios (vueltas, castigo de gomas, coste de boxes, dificultad de adelantamiento) que diferencien la estrategia entre ellos.
- **FR-002**: El calendario DEBE ser un orden fijo de 20 rondas con identidad estable entre sesiones (la ronda 3 es siempre el mismo circuito), y el progreso debe recordar por dónde va.
- **FR-003**: El botón de carrera DEBE mostrar la ronda y el circuito actuales; tras cada carrera registrada el calendario DEBE avanzar, salvo en la última ronda, que DEBE anunciar la temporada completada y conducir al resumen.
- **FR-004**: Cada carrera registrada DEBE guardar, además de la economía (spec 004), el mejor puesto de mis coches y los puntos conseguidos por los 20 pilotos con la puntuación estándar de la F1 (25-18-15-12-10-8-6-4-2-1, nada desde el 11º).
- **FR-005**: El juego DEBE acumular por temporada las tablas de pilotos y de constructores, ordenadas por puntos, con mi equipo destacado, el equipo de cada piloto visible y un estado vacío que explique qué hacer.
- **FR-006**: El resumen de temporada DEBE listar cada ronda (circuito, mejor puesto mío, premio) con el total de premios ganado y el presupuesto, distinguir temporada completada de parcial y avisar si no hay carreras.
- **FR-007**: "Empezar temporada nueva" DEBE subir el número de temporada, vaciar resultados y calendario, y conservar presupuesto, mejoras del coche, sede y patrocinadores.
- **FR-008**: Con la temporada completada, el acceso a carrera DEBE convertirse en acceso al resumen (nunca carrera 21).

### Entidades clave

- **Circuito**: trazado (su forma), vueltas totales y sus números de personalidad (los efectos en carrera los define el motor, spec 001).
- **Calendario**: la lista ordenada de los 20 circuitos de la temporada y la ronda por la que va.
- **Resultado de temporada**: por carrera registrada: circuito, mejor puesto de mis coches, premio total y la puntuación completa de los 20 pilotos.
- **Tabla de campeonato**: pilotos y constructores con sus puntos acumulados de la temporada.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: La tabla de circuitos lista 20 GPs con datos distintos entre sí (sin duplicados) y estables entre ejecuciones.
- **SC-002**: Tras n carreras, las tablas de campeonato suman exactamente los puntos de esas n carreras (verificable a mano en carreras pequeñas).
- **SC-003**: Tras "Empezar temporada nueva", el calendario vuelve a R1, las tablas a cero y el presupuesto y las mejoras quedan intactos.
- **SC-004**: El total del resumen de temporada coincide con la suma de los premios de sus filas.

## Supuestos

- Especificación retrospectiva: los trazados provienen de trazas GPS reales (OpenStreetMap) convertidas con la herramienta del repo; el origen de los datos es diseño, no requisito del usuario.
- La economía de cada carrera es de la spec 004; aquí el marco temporal.
- El clima por carrera (40 % con riesgo de lluvia) se decide al construir la carrera, dentro de esta función de fin de semana.
- Todo en español (Constitución IV).
