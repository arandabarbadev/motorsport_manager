# Especificación de la función: Carrera viva

**Rama de la función**: `012-carrera-viva`

**Creada**: 2026-10-17

**Estado**: Borrador

**Entrada**: Descripción del usuario: "mejoras: que los coches no vayan como scalextric (que se muevan por toda la pista), accidentes visibles, animaciones que faltan (p. ej. semáforo de salida), y bajar el % de lluvia." Decisión de Rafa (2026-10-17): lluvia global del 40 % al 25 % de las carreras.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Coches que usan la pista (Prioridad: P1)

Como jugador quiero ver los coches desplazarse lateralmente por el asfalto —buscando la trazada, abriéndose en las curvas y peleando el sitio en las batallas— para que la carrera se vea viva y no como un circuito de scalextric.

**Por qué esta prioridad**: es la queja original ("scalextric"); sin movimiento lateral lo demás es maquillaje.

**Prueba independiente**: durante una carrera, los coches no van encadenados a la línea central: se reparten por el ancho del asfalto y cambian de lado de forma suave (adelanten o defiendan).

**Escenarios de aceptación**:

1. **Dado** cualquier momento de la carrera, **cuando** miro el trazado, **entonces** los coches circulan repartidos por el ancho de la pista, no en fila india sobre la línea central.
2. **Dado** un coche cerca de otro (batalla), **cuando** ruedan juntos, **entonces** se abren a lados opuestos del asfalto: se ve el intento de adelantamiento.
3. **Dado** una curva, **cuando** los coches la toman, **entonces** tienden al interior de la curva (trazada) en vez de seguir la línea central como un raíl.
4. **Dado** bandera amarilla, **cuando** el campo pasa por la zona, **entonces** los coches se ordenan más en fila (protocolo), sin bailes bruscos.
5. **Dado** la parrilla formada antes de la salida, **cuando** están parados, **entonces** se ven escalonados y alternando lados, como una parrilla de verdad.

---

### Historia de usuario 2 - Accidentes visibles (Prioridad: P1)

Como jugador quiero VER cuando algo pasa —trompos, accidentes, averías— con su animación, su aviso y su rastro en la dirección de carrera, para que las banderas y los DNF tengan causa visible y no aparezcan de la nada.

**Por qué esta prioridad**: el motor ya tiene incidentes (trompos, choques, averías) pero el jugador solo ve una bandera y un DNF en la tabla: el accidente en sí es invisible.

**Prueba independiente**: forzado un incidente, aparece su animación en el coche (destello y texto flotante), el suceso queda en el feed de "Dirección de carrera" y el coche accidentado queda marcado en pista.

**Escenarios de aceptación**:

1. **Dado** un trompo, **cuando** ocurre, **entonces** el coche destella con un anillo y un texto flotante ("¡Trompo!") y sale bandera amarilla.
2. **Dado** un accidente (choque), **cuando** ocurre, **entonces** misma señal más dramática y el coche pasa a visible-fuera (fantasma apagado) en su punto de la pista; puede traer bandera roja.
3. **Dado** una avería mecánica, **cuando** ocurre, **entonces** el coche queda marcado como fuera sin bandera (silencioso pero visible).
4. **Dado** cualquier suceso de carrera (adelantamiento, boxes, incidentes), **cuando** miro el panel "Dirección de carrera", **entonces** veo los últimos sucesos con su vuelta, en orden.
5. **Dado** un incidente de un coche rival, **cuando** ocurre, **entonces** también se ve (los sucesos no son solo de mis coches).

---

### Historia de usuario 3 - Semáforo de salida (Prioridad: P1)

Como jugador quiero que cada evento arranque con el semáforo de 5 luces —se encienden una a una y se apagan para largar— para que la salida sea un momento y no un cortocircuito.

**Por qué esta prioridad**: es la animación ausente más visible del juego; la pediste expresamente.

**Prueba independiente**: al entrar en cualquier evento, las 5 luces se encienden de una en una y al apagarse empieza la carrera (la vuelta 1 arranca ahí, no antes).

**Escenarios de aceptación**:

1. **Dado** el inicio de un evento (los cuatro actos), **cuando** entra la pantalla, **entonces** los coches están parados en parrilla y el semáforo comienza su secuencia.
2. **Dado** las 5 luces encendidas, **cuando** pasa una pausa breve aleatoria, **entonces** se apagan todas y la carrera arranca ("¡Luces fuera!").
3. **Dado** el semáforo en marcha, **cuando** espero, **entonces** el reloj de carrera no avanza hasta que se apagan las luces (la formación no cuenta como tiempo).
4. **Dado** "Repetir {acto}", **cuando** se reinicia, **entonces** el semáforo se repite desde cero.

---

### Historia de usuario 4 - Menos lluvia (Prioridad: P2)

Como jugador quiero que llueva con menos frecuencia (del 40 % al 25 % de las carreras), para que la lluvia siga siendo un acontecimiento y no la norma encubierta.

**Por qué esta prioridad**: es un número, no una construcción; cambia una constante.

**Prueba independiente**: la lotería de lluvia de la carrera pasa de 40 % a 25 % (los actos cortos mantienen su proporción sobre la global).

**Escenarios de aceptación**:

1. **Dado** una carrera nueva, **cuando** se construye, **entonces** su riesgo de lluvia dinámica se sortea al 25 % (antes 40 %).
2. **Dado** clasificación/sprints, **cuando** se construyen, **entonces** siguen con el 40 % del riesgo de la carrera (0,25 × 0,4 = 10 %).

### Casos límite

- ¿El desplazamiento lateral afecta al motor? No: es cosmético, vive solo en el render; posiciones, huecos y adelantamientos los sigue decidiendo el motor.
- ¿Coches en boxes o fuera? Los coches en boxes se pintan atenuados como ahora; los DNF siguen como fantasma apagado (con su señal de accidente al producirse).
- ¿Semáforo + pausa/velocidad? Durante el semáforo no hay carrera que pausar: los botones esperan a las luces fuera.
- ¿Semáforo al reanudar un acto? Cada entrada a un evento (nueva o reanudada) empieza con semáforo: es su salida, no una continuación.
- ¿Feed infinito? El panel "Dirección de carrera" guarda solo los últimos sucesos (recorta), como los textos flotantes.
- ¿Lluvia ya sorteada? El cambio es para carreras nuevas; una carrera ya construida mantiene su clima.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: Los coches DEBEN desplazarse lateralmente por el ancho del asfalto de forma suave y continua (sin teletransportes), con suavizado de transición; el desplazamiento es COSMÉTICO (no altera el motor).
- **FR-002**: En las batallas (coches muy próximos) los coches DEBEN abrirse a lados opuestos; en curva DEBEN tender al interior; en bandera amarilla DEBEN ordenarse hacia la trazada; en parrilla DEBEN alternar lados de forma estable.
- **FR-003**: Los incidentes del motor (trompo, choque, avería) DEBEN emitir un suceso visible: anillo de destello + texto flotante en el coche, entrada en el feed de dirección de carrera y (choque/avería) coche marcado como fuera en pista; rival o propio indistintamente.
- **FR-004**: Cada evento DEBE empezar con un semáforo de 5 luces que se encienden secuencialmente y se apagan tras una pausa breve aleatoria; hasta entonces la simulación no avanza y el reloj está a cero.
- **FR-005**: El riesgo global de lluvia de la carrera DEBE bajar del 40 % al 25 %; los actos cortos mantienen su proporción (40 % del riesgo de la carrera).

### Entidades clave

- **Trazada lateral** (nueva, render): posición transversal de cada coche en el asfalto, derivada de batallas/curvas/estilo, con suavizado; no se persiste.
- **Suceso de carrera** (extensión del evento del motor): los incidentes se suman a adelantamientos y entradas a boxes como sucesos consumibles por la vista.
- **Semáforo de salida** (nueva, vista): estado efímero de formación por evento; no se persistide.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: En una carrera en marcha, los coches pintados ocupan el ancho del asfalto (desplazamiento lateral no nulo y variable en el tiempo), con cambios suaves — verificado en vivo sobre el canvas.
- **SC-002**: Forzado un incidente, el mismo instante muestra anillo+texto en el coche, línea nueva en "Dirección de carrera" y bandera/estado coherentes (amarilla en trompo/choque, nada en avería).
- **SC-003**: Al entrar en un evento: 5 luces encendidas una a una → apagadas → la vuelta 1 y el reloj arrancan DESPUÉS del apagado; el reinicio del acto repite la secuencia.
- **SC-004**: La constante de lluvia de la carrera es 0,25 en el código construido y los actos cortos derivan de ella (10 %).

## Supuestos

- "Accidentes visibles" se entiende como señal clara en pista + feed, no como físicas de choque (el motor de posiciones no cambia).
- La trazada lateral puede simplificarse a interior de curva + batallas + deriva personal: no se replica una física de neumáticos.
- El semáforo usa el patrón F1 (5 luces rojas, se apagan para largar).
