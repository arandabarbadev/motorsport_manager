# Especificación de la función: Motor de simulación de carrera

**Rama de la función**: `001-motor-carrera`

**Creada**: 2026-10-10

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Un motor de simulación de carrera de F1 que corre solo: 20 coches con ritmo propio, neumáticos que se gastan, paradas en boxes de la IA, accidentes con banderas y clima que puede cambiar. Validado sin interfaz." Especificación retrospectiva (Fase 1 del desarrollo + extensiones de Fase 7).

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - La carrera corre sola y termina (Prioridad: P1)

Como jugador quiero que una carrera entera se desarrolle sola, vuelta a vuelta, y que termine cuando el líder completa la distancia, con una clasificación final creíble.

**Por qué esta prioridad**: sin simulación que termine sola no hay juego; todo lo demás se apoya en ella.

**Prueba independiente**: correr el motor sin interfaz (`npm run harness`): imprime la tabla final de una carrera completa de 40 vueltas.

**Escenarios de aceptación**:

1. **Dado** un estado de carrera con 20 coches, **cuando** el motor avanza tick a tick, **entonces** cada coche progresa según su ritmo y las posiciones se recalculan.
2. **Dado** el líder completando la última vuelta, **cuando** termina, **entonces** la carrera se congela (los ticks posteriores no cambian nada) y la clasificación se lee tal cual.
3. **Dado** un coche que no puede seguir (accidente o avería), **cuando** se retira, **entonces** queda marcado como fuera y deja de moverse, pero el resto sigue compitiendo.

---

### Historia de usuario 2 - El ritmo sale del piloto y del coche (Prioridad: P1)

Como jugador quiero que un piloto bueno en un buen coche adelante a uno mediocre, y que las gomas y el clima cuenten, para que mis decisiones de fichajes y desarrollo tengan efecto en pista.

**Por qué esta prioridad**: es la regla de oro del juego de gestión: si la simulación no premia las mejoras, gestionar no sirve de nada.

**Prueba independiente**: el harness mide la correlación entre el ritmo de los pilotos y su posición final: negativa (los rápidos delante).

**Escenarios de aceptación**:

1. **Dado** dos coches iguales con pilotos de ritmo distinto, **cuando** corren, **entonces** el más rápido acaba antes en la clasificación (correlación negativa sostenida).
2. **Dado** neumáticos gastándose, **cuando** el desgaste crece, **entonces** el ritmo cae (a más goma usada, más lento), pero nunca se queda a cero: un coche con gomas muertas avanza a rastras.
3. **Dado** lluvia, **cuando** llueve, **entonces** todos pierden ritmo, y los pilotos hábiles bajo lluvia pierden menos.
4. **Dado** pilotos con distinta consistencia, **cuando** corren, **entonces** el menos consistente tiene más variación de ritmo segundo a segundo.

---

### Historia de usuario 3 - Los rivales deciden sus paradas (Prioridad: P2)

Como jugador quiero que los rivales paren en boxes por su cuenta, en momentos razonables y no todos a la vez, para que mis estrategias compitan contra algo.

**Por qué esta prioridad**: las paradas son la decisión estratégica del juego; sin IA rival, la estrategia del jugador compite contra nada.

**Prueba independiente**: en el harness, las 18 IA reparten sus paradas en vueltas distintas (no todas en la misma).

**Escenarios de aceptación**:

1. **Dado** gomas muy gastadas (90 % o más), **cuando** toca evaluar, **entonces** la IA para sí o sí (parada de supervivencia).
2. **Dado** gomas casi nuevas (menos del 25 %), **cuando** toca evaluar, **entonces** la IA no para, salvo que lleve gomas equivocadas para el clima.
3. **Dado** goma inadecuada (liso con lluvia, o gomas de lluvia con pista seca), **cuando** toca evaluar, **entonces** la IA para y monta la goma correcta.
4. **Dado** pocas vueltas para el final (menos de 3), **cuando** toca evaluar, **entonces** la IA aguanta en pista.
5. **Dado** la elección de compuesto en seco, **cuando** queda poca carrera monta blandas, **cuando** queda mucha monta duras, y en medio, medias.

---

### Historia de usuario 4 - Pasan cosas: accidentes, averías y banderas (Prioridad: P2)

Como jugador quiero accidentes y averías esporádicos que cambien la carrera, con banderas que se vean y duren, para que cada carrera cuente una historia distinta.

**Por qué esta prioridad**: el caos controlado es lo que hace rejugable la simulación; sin incidentes, cada carrera es la misma.

**Prueba independiente**: carreras del harness con DNF ocasionales y la carrera siempre completada por el resto.

**Escenarios de aceptación**:

1. **Dado** la carrera en verde, **cuando** un coche sufre un toque leve, **entonces** sale bandera amarilla unos 25 segundos y todo el pelotón aminora (55 % del ritmo).
2. **Dado** un accidente grave, **cuando** ocurre, **entonces** el coche queda fuera y sale bandera amarilla o, a veces, bandera roja.
3. **Dado** bandera roja, **cuando** está activa (~70 s), **entonces** la carrera se suspende: nadie se mueve, no se desgastan gomas y no se planifican paradas.
4. **Dado** una avería mecánica, **cuando** ocurre, **entonces** el coche abandona sin bandera (no molesta a nadie).
5. **Dado** lluvia o pilotos agresivos, **cuando** se calcula el riesgo, **entonces** los incidentes son más frecuentes que en seco con pilotos tranquilos.
6. **Dado** un coche fiable, **cuando** corre, **entonces** se avería menos que uno poco fiable.

---

### Historia de usuario 5 - El clima puede cambiar a mitad de carrera (Prioridad: P3)

Como jugador quiero que en algunas carreras empiece a llover (o a escampar) a mitad de carrera, para que la estrategia tenga un factor sorpresa.

**Por qué esta prioridad**: enriquece la estrategia, pero solo afecta a algunas carreras: es la guinda, no el pastel.

**Prueba independiente**: con el cambio de clima activado, el estado del tiempo varía por pasos (seco → lluvia ligera → lluvia fuerte, y al revés) a lo largo de una carrera.

**Escenarios de aceptación**:

1. **Dado** una carrera marcada sin riesgo de lluvia, **cuando** corre, **entonces** el tiempo no cambia de principio a fin.
2. **Dado** una carrera con riesgo de lluvia, **cuando** pasa el tiempo, **entonces** el clima cambia por pasos, nunca de golpe (de seco a diluvio, por ejemplo).
3. **Dado** cambio de clima, **cuando** se produce, **entonces** no es constante: ocurre pocas veces por carrera.

---

### Casos límite

- ¿Dos coches en la misma fracción de vuelta? El orden se desempata por progreso total acumulado (vueltas + fracción); no hay empates.
- ¿Un piloto o coche sin datos en la plantilla? El motor usa valores de respaldo (70) y sigue corriendo en lugar de romper.
- ¿Orden de parada duplicada para el mismo piloto? Se ignora la repetida: solo puede tener una parada pendiente.
- ¿Órdenes de boxes mientras el coche está en boxes o retirado? Se descartan silenciosamente.
- ¿Carrera pausada? El tick no avanza nada (ni desgaste ni clima ni incidentes).
- ¿Coches del jugador? Nunca son manejados por la IA de boxes: sus paradas salen solo de órdenes del jugador (spec 002).

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El motor DEBE avanzar la carrera por ticks, moviendo cada coche según su ritmo, y DEBE recalcular posiciones y huecos con el líder al final de cada tick.
- **FR-002**: El ritmo DEBE combinar piloto (~60 %) y coche (~40 %), penalizar el desgaste de gomas y la lluvia (menos cuanto mejor habilidad en mojado del piloto), y sumar variación según la consistencia del piloto.
- **FR-003**: El desgaste de gomas DEBE crecer con el tiempo, más rápido en blandas y más lento en duras, escalado por lo castigadora que sea cada pista.
- **FR-004**: Una orden de parada DEBE encolarse y ejecutarse solo cuando el coche cruza la línea de meta, nunca a mitad de vuelta; la parada dura lo que cuesta el callejón de boxes de la pista (o el valor mejorado del jugador) y el coche queda detenido ese tiempo.
- **FR-005**: La IA rival DEBE decidir sus paradas con una puntuación de utilidad (desgaste, amenaza de undercut, coste de la parada, agresividad, valor de la posición y tolerancia al riesgo), con parada forzosa a partir del 90 % de desgaste y prohibida por debajo del 25 % o con menos de 3 vueltas restantes.
- **FR-006**: La IA rival DEBE parar de inmediato si lleva gomas inadecuadas para el clima, montando gomas de lluvia si llueve o compuesto de seco si no.
- **FR-007**: El motor DEBE generar incidentes aleatorios: toques leves (bandera amarilla ~25 s que frena al pelotón), accidentes (abandono + amarilla o roja ~70 s que suspende la carrera) y averías mecánicas (abandono sin bandera); la frecuencia DEBE escalar con agresividad/riesgo del piloto, la lluvia y la poca fiabilidad del coche.
- **FR-008**: El motor DEBE emitir en cada tick la lista de eventos ocurridos (adelantamientos y entradas a boxes) para que la interfaz los pinte, sin que esta tenga que deducirlos.
- **FR-009**: El clima DEBE poder cambiar por pasos (seco ↔ lluvia ligera ↔ lluvia fuerte) solo en carreras marcadas con riesgo; el resto permanece seco.
- **FR-010**: La carrera DEBE terminar al completar el líder la distancia total; a partir de ahí el estado queda congelado y la clasificación se lee como está.
- **FR-011**: El motor DEBE ser agnóstico de la interfaz: no conoce ni Canvas ni el DOM; solo lee y escribe el estado de carrera.

### Entidades clave

- **Estado de carrera**: la foto completa de una carrera: pista, clima, bandera, tick actual, multiplicador de tiempo, pausa y los 20 coches.
- **Coche en carrera**: piloto, coche y equipo; progreso de vuelta, vuelta actual, goma (compuesto, desgaste, vueltas con ella), hueco con el líder, posición, paradas hechas, estado (corriendo / en boxes / retirado) y si lo controla el jugador.
- **Piloto**: ritmo, consistencia, agresividad, habilidad en mojado y tolerancia al riesgo (0-100).
- **Coche (spec)**: aerodinámica, motor, chasis y fiabilidad.
- **Pista**: trazado, vueltas totales, dificultad de adelantamiento, cuánto castiga las gomas y cuánto se pierde en boxes.
- **Orden de boxes**: piloto y compuesto nuevo, encolada a la espera de que el coche cruce meta.
- **Evento de carrera**: adelantamiento (posición previa y nueva) o entrada a boxes, generado por el motor en el tick en que ocurre.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: En carreras del banco de pruebas, la correlación de rangos entre ritmo del piloto y posición final es negativa (los rápidos acaban delante) de forma sostenida.
- **SC-002**: Las paradas de la IA se reparten en vueltas distintas (no todas en la misma vuelta) y hay entre 1 y 4 por coche en una carrera de 40 vueltas.
- **SC-003**: Una carrera de 40 vueltas con 20 coches completa en menos de 500 ticks a velocidad 10x, sin quedarse ningún coche clavado (ritmo mínimo > 0).
- **SC-004**: En un puñado de carreras consecutivas hay alguna con banderas y abandonos y alguna limpia: los incidentes son posibles pero no constantes.
- **SC-005**: El motor corre sin interfaz alguna (banco de pruebas por consola) y produce el mismo tipo de informe carrera tras carrera.

## Supuestos

- Especificación retrospectiva: el motor ya existe y fue validado sin interfaz (Fase 1) antes de pintar nada; los números de equilibrio son valores iniciales aprobados por el jugador, a reajustar jugando.
- Los coches del jugador no usan la IA de boxes: sus paradas salen de órdenes manuales (spec 002).
- El clima con riesgo por carrera (40 % de las carreras) lo decide quien construye la carrera (spec 005), no el motor.
- Todo en español (Constitución IV).
