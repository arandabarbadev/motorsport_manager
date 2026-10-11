# Especificación de la función: Carrera en vivo (pantalla 2D)

**Rama de la función**: `002-pantalla-carrera`

**Creada**: 2026-10-10

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Veo la carrera desde arriba en tiempo real: el circuito, los 20 coches con sus colores, la clasificación que se actualiza, y decido mis paradas en boxes mientras la carrera corre. Con pausa y velocidades." Especificación retrospectiva (Fase 2 del desarrollo + extensiones de Fase 7).

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Ver la carrera (Prioridad: P1)

Como jugador quiero ver el circuito desde arriba con los 20 coches corriendo de verdad, cada uno con el color de su equipo y los míos destacados, para vivir la carrera en lugar de leer un resultado.

**Por qué esta prioridad**: es la pantalla del juego; sin ella, la simulación es una hoja de cálculo.

**Prueba independiente**: entrar en cualquier carrera: el trazado se dibuja y los 20 coches se mueven fluidos, se adelantan y doblan.

**Escenarios de aceptación**:

1. **Dado** un circuito, **cuando** se abre la carrera, **entonces** se dibuja la pista completa (asfalto, bordes, línea de meta) ocupando el espacio disponible.
2. **Dado** la carrera corriendo, **cuando** miro el trazado, **entonces** cada coche es un punto del color de su equipo, con los míos remarcados en dorado, y se mueven sin saltos (movimiento suavizado entre ticks).
3. **Dado** un coche retirado, **cuando** miro la pista, **entonces** queda como un fantasma tenue en el punto donde murió.
4. **Dado** un coche en boxes, **cuando** está parando, **entonces** se ve más pequeño y atenuado, no congelado en pista.
5. **Dado** el móvil o la ventana cambiando de tamaño, **cuando** giro o redimensiono, **entonces** el circuito se recalcula y sigue completo y visible.

---

### Historia de usuario 2 - Decidir mis paradas en caliente (Prioridad: P1)

Como jugador quiero ordenar la parada de cada uno de mis dos coches eligiendo la goma, y que entre en boxes al cruzar la meta, para jugar la estrategia mientras la carrera pasa.

**Por qué esta prioridad**: es la única decisión del jugador durante la carrera; sin ella, mirar no es jugar.

**Prueba independiente**: con la carrera corriendo, pulsar una goma en "Mis boxes": el aviso salta y el coche para al completar vuelta.

**Escenarios de aceptación**:

1. **Dado** un coche mío corriendo, **cuando** pulso una goma (blando/medio/duro/lluvia), **entonces** la orden se encola y me avisan de que entrará al cruzar meta.
2. **Dado** la orden encolada, **cuando** el coche completa la vuelta, **entonces** para, cambia de goma y el panel cuenta la parada y su cuenta atrás.
3. **Dado** la carrera terminada, en pausa o el coche fuera de pista, **cuando** intento ordenar, **entonces** los botones no hacen nada (deshabilitados).
4. **Dado** un aviso de mi coche, **cuando** miro la pista, **entonces** veo textos flotantes ("¡A boxes!", "¡Adelantamiento! P4") saliendo de mi coche.

---

### Historia de usuario 3 - La clasificación en vivo (Prioridad: P1)

Como jugador quiero la tabla de posiciones al día —posición, hueco, goma y desgaste de cada coche— para saber a quién tengo delante y cuándo conviene parar.

**Por qué esta prioridad**: la estrategia se decide con datos: sin huecos y desgastes, las paradas son a ciegas.

**Prueba independiente**: durante una carrera, la tabla se reordena sola al adelantar y los desgastes suben vuelta a vuelta.

**Escenarios de aceptación**:

1. **Dado** la carrera corriendo, **cuando** alguien adelanta, **entonces** la fila cambia de sitio (la tabla se reordena) al momento.
2. **Dado** un coche, **cuando** miro su fila, **entonces** veo su posición, color y nombre del piloto (los míos con "(tú)"), hueco con el líder (+segundos, +vueltas o "líder", "DNF" si está fuera), letra de la goma y barra de desgaste que cambia de color al preocupante.
3. **Dado** mi coche parando, **cuando** miro su fila, **entonces** veo el aviso de boxes con los segundos que le quedan.

---

### Historia de usuario 4 - Controlar el tiempo de la carrera (Prioridad: P2)

Como jugador quiero pausar y acelerar la carrera a mi gusto (1x a 20x), y poder empezar de cero una carrera mal planteada, para adaptar el ritmo a mi momento.

**Por qué esta prioridad**: una carrera a tiempo real son 75 minutos; sin velocidades, el juego no se puede jugar de verdad.

**Prueba independiente**: alternar pausa y velocidades: el reloj de carrera avanza a razón del multiplicador y los coches ni tiemblan.

**Escenarios de aceptación**:

1. **Dado** la carrera, **cuando** pulso Pausa/Seguir, **entonces** todo se congela y reanuda sin perder estado.
2. **Dado** la carrera, **cuando** cambio de velocidad (1x/5x/10x/20x), **entonces** el botón activo se marca y la carrera va más rápido o más despacio.
3. **Dado** el inicio de una carrera, **cuando** se construye, **entonces** arranca a 1x (empieza suave; acelero yo).
4. **Dado** una carrera sin terminar, **cuando** pulso "Nueva carrera", **entonces** se reconstruye entera desde cero (misma parrilla de salida, sin coste ni premio).
5. **Dado** la carrera terminada, **cuando** miro los controles, **entonces** pausa, velocidad y nueva carrera quedan deshabilitados: la carrera ya está en el historial.

---

### Historia de usuario 5 - La cabecera lo resume todo (Prioridad: P3)

Como jugador quiero ver de un vistazo GP, vuelta, clima y reloj, además de las banderas y el final con premios, para no buscar la información por la pantalla.

**Por qué esta prioridad**: contexto, no mecánica: mejora la lectura del resto.

**Prueba independiente**: durante la carrera, la cabecera muestra "GP · Vuelta X/58 · Seco · 12:34"; al terminar, el panel de resultados tapa la pista.

**Escenarios de aceptación**:

1. **Dado** la carrera, **cuando** miro arriba, **entonces** veo el nombre del GP, la vuelta actual/total, el clima (y "riesgo de lluvia" si la carrera puede mojarse) y el reloj de carrera.
2. **Dado** una bandera activa, **cuando** está en vigor, **entonces** un aviso sobre la pista dice cuál y cuánto le queda; con la bandera a cuadros, lo celebra.
3. **Dado** la carrera terminada, **cuando** el líder cruza la meta, **entonces** aparece el panel de resultados con mis dos coches, sus premios y el balance de la carrera (spec 004), y de ahí salgo a "Mi Equipo" o al resumen de temporada si era la última.
4. **Dado** la carrera corriendo, **cuando** quiero volver, **entonces** "Mi Equipo" me saca de la carrera (sin cobrar nada: la carrera no disputada no cuenta).

---

### Casos límite

- ¿Cambio de pestaña o portátil dormido? El tick sigue con su intervalo; al volver, el suavizado se reancla al último tick sin saltos.
- ¿Carrera terminada y botón atrás? Los premios ya cobrados no se pagan dos veces (lo impide la spec 004); el calendario nunca retrocede.
- ¿"Nueva carrera" tras terminar? Deshabilitado: la carrera ya cuenta; la siguiente se entra desde "Mi Equipo".
- ¿Colores del equipo iguales al fondo del circuito? Los coches llevan borde de contraste y los míos borde dorado.
- ¿Pantalla muy pequeña? El HUD y los controles se compactan en vertical (CSS propio de la pantalla de carrera).

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: La pantalla DEBE dibujar el circuito en un lienzo con asfalto, bordes y línea de meta, y los 20 coches como puntos del color de su equipo, con los del jugador remarcados; los retirados se muestran atenuados y los que están en boxes, reducidos.
- **FR-002**: El movimiento DEBE verse fluido: la posición pintada interpola entre el tick anterior y el actual, sin mutar el estado del motor.
- **FR-003**: El jugador DEBE poder ordenar la parada de cada coche suyo eligiendo compuesto (blando, medio, duro o lluvia); la orden se aplica cuando el coche cruza la meta y la pantalla lo avisa antes y durante la parada.
- **FR-004**: La tabla de clasificación DEBE actualizarse sola: reordenación por posición, hueco con el líder (segundos, vueltas, líder o DNF), compuesto y desgaste con barra de color por gravedad, mis coches destacados y aviso de boxes con cuenta atrás.
- **FR-005**: La pantalla DEBE ofrecer pausa y velocidades 1x/5x/10x/20x, con la activa marcada, y las carreras DEBEN arrancar a 1x.
- **FR-006**: Antes de terminar, la pantalla DEBE permitir empezar la carrera de cero sin coste ni premio; tras la bandera a cuadros, TODOS los controles de carrera quedan deshabilitados.
- **FR-007**: La cabecera DEBE mostrar GP, vuelta actual/total, clima (con aviso de riesgo de lluvia si aplica) y reloj de carrera; las banderas activas se avisan sobre la pista con su duración restante.
- **FR-008**: Al terminar la carrera DEBE aparecer el panel de resultados con la actuación de mis coches y el balance económico (este, de la spec 004), y los botones de salida a gestión o al resumen de temporada.
- **FR-009**: Los efectos en pantalla (destellos y textos flotantes de adelantamientos y paradas) DEBEN surgir solo de los eventos que emite el motor, nunca deducirse en la pantalla.
- **FR-010**: La simulación DEBE correr en su propio intervalo y el dibujo en el bucle de animación, leyendo el estado sin escribirlo jamás (reglas fijas 1-2).

### Entidades clave

- Sin entidades de datos propias: lee el estado de carrera del motor (spec 001) y escribe las órdenes de boxes. Sus propios datos son efímeros (sombra del tick anterior para el suavizado, textos flotantes).

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: En un portátil corriente, la carrera se pinta fluida (bucle de animación activo) con los 20 coches en pantalla a 10x sin tirones perceptibles.
- **SC-002**: El HUD y la cabecera refrescan varias veces por segundo (~5) y la tabla se reordena en el mismo refresco en que ocurre el adelantamiento.
- **SC-003**: Una orden de boxes pulsada entra en efecto exactamente en la siguiente pasada por meta del coche, nunca en mitad de vuelta.
- **SC-004**: El circuito se ve completo en móvil en vertical y en escritorio, sin recortes, tras giro o redimensionado.

## Supuestos

- Especificación retrospectiva: la pantalla ya existe; el detalle visual (colores, grosores) vive en el plan, no aquí.
- El panel de resultados muestra datos económicos de la spec 004; aquí solo se exige que exista y resuma la carrera.
- La parrilla y el GP actual los aporta la navegación (specs 003 y 005).
- Todo en español (Constitución IV).
