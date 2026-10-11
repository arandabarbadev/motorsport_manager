# Especificación de la función: Mi Equipo y la parrilla de rivales

**Rama de la función**: `003-equipo-rivales`

**Creada**: 2026-10-10

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Mi escudería con nombre, color y dos pilotos míos, nueve equipos rivales generados con sus pilotos, y el desarrollo del coche en 9 categorías que pago con mi presupuesto. Todo guardado en mi navegador." Especificación retrospectiva (Fase 3 del desarrollo + desarrollos pedidos el 2026-09-27).

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Mi escudería, a mi nombre (Prioridad: P1)

Como jugador quiero ponerle nombre a mi equipo, elegir el color de la librea y el nombre de mis dos pilotos, y que se quede guardado, para que la parrilla me reconozca.

**Por qué esta prioridad**: sin identidad propia no hay "mi equipo"; es el gancho emocional mínimo.

**Prueba independiente**: editar nombre, color y pilotos, recargar: todo sigue ahí (y en la carrera se ve el color).

**Escenarios de aceptación**:

1. **Dado** el panel de mi equipo, **cuando** escribo el nombre del equipo o de un piloto, **entonces** se guarda al instante y la carrera y el campeonato lo usan.
2. **Dado** el selector de color, **cuando** elijo librea, **entonces** mis coches y filas cambian a ese color en carrera y clasificaciones.
3. **Dado** un campo de nombre vaciado, **cuando** salgo del campo, **entonces** vuelve el valor anterior (no se guarda un nombre en blanco).
4. **Dado** el juego reabierto, **cuando** entro, **entonces** mi equipo está intacto sin hacer nada.

---

### Historia de usuario 2 - Un coche que mejora con mi dinero (Prioridad: P1)

Como jugador quiero gastar presupuesto en desarrollar el coche por categorías (aerodinámica, motor, chasis…), con niveles máximos, para que mis decisiones económicas se note en pista.

**Por qué esta prioridad**: es el bucle central del juego de gestión: ganar → invertir → ganar más.

**Prueba independiente**: comprar un nivel y correr: mi coche efectivo sube (hasta el tope) y la parrilla de salida me respeta más.

**Escenarios de aceptación**:

1. **Dado** una categoría de desarrollo a nivel 0, **cuando** pago un punto, **entonces** el nivel sube, el presupuesto baja y el coste es el mismo por punto (con el descuento de ingenieros si lo tengo, spec 004).
2. **Dado** el nivel máximo (10), **cuando** miro la categoría, **entonces** no se puede seguir comprando ("MÁX").
3. **Dado** presupuesto insuficiente, **cuando** miro el botón, **entonces** está deshabilitado: no hay números rojos.
4. **Dado** niveles comprados en varias categorías, **cuando** se construye la carrera, **entonces** mis DOS coches corren con las mejoras aplicadas y con un tope de calidad (el resto de la parrilla no cambia).
5. **Dado** mi coche de salida, **cuando** empiezo la partida, **entonces** está por debajo de la media de los rivales: desarrollar es el camino hacia arriba.

---

### Historia de usuario 3 - Una parrilla de rivales con vida propia (Prioridad: P2)

Como jugador quiero nueve equipos rivales generados, con pilotos de nombres únicos y números distintos a los míos, y poder regenerarlos cuando la parrilla se me haya quedado vieja, para competir contra alguien.

**Por qué esta prioridad**: los rivales son el adversario del bucle, pero el jugador ya puede correr con los generados por defecto.

**Prueba independiente**: "Generar parrilla nueva": tras confirmar, hay 9 rivales distintos; mi equipo ni mi dinero se tocan.

**Escenarios de aceptación**:

1. **Dado** la pestaña de rivales, **cuando** la abro, **entonces** veo 9 equipos con color, nombre, dos pilotos y sus números medios de coche.
2. **Dado** "Generar parrilla nueva", **cuando** la pulso, **entonces** pide confirmación avisando de que se pierden los nombres editados de los rivales.
3. **Dado** la confirmación aceptada, **cuando** se regenera, **entonces** hay nombres y números nuevos, pero mi equipo, mis pilotos, mis desarrollos y mi presupuesto siguen igual.
4. **Dado** un rival, **cuando** edito el nombre de su equipo o de sus pilotos, **entonces** se guarda como cualquier otro dato.

---

### Historia de usuario 4 - La salida refleja quién es más rápido (Prioridad: P3)

Como jugador quiero que la parrilla de salida ordene los coches por su ritmo esperado (piloto + coche), para que la clasificación inicial tenga sentido y mis mejoras muevan mi puesto de salida.

**Por qué esta prioridad**: da continuidad entre gestión y carrera; sin ella, la salida sería aleatoria.

**Prueba independiente**: entrar en una carrera con el coche mejorado: mi puesto de salida sube respecto a la partida nueva.

**Escenarios de aceptación**:

1. **Dado** la plantilla, **cuando** se construye la carrera, **entonces** la salida ordena los 20 coches por ritmo esperado (mejor piloto y coche, más adelante), con hueco entre ellos.
2. **Dado** mi coche con varias mejoras, **cuando** vuelvo a correr, **entonces** salgo más arriba que al principio de la partida.

---

### Casos límite

- ¿Guardado roto o de otra versión? La plantilla se regenera por completo (parrilla nueva); la economía vive aparte y no se pierde.
- ¿Guardar antiguo sin desarrollos? Se tratan como nivel 0 en todas las categorías (migración silenciosa).
- ¿Nombre de piloto repetido entre rivales? El generador los exige únicos; si agota intentos, numerados.
- ¿Nombre de equipo repetido? Los nombres de EQUIPO no se exigen únicos (solo los de piloto): es raro por la cantidad de combinaciones y no rompe nada.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El jugador DEBE poder editar y persistir el nombre de su equipo, el color de librea y el nombre de sus dos pilotos; un nombre vaciado NO se guarda.
- **FR-002**: El juego DEBE ofrecer el desarrollo del coche en 9 categorías (aerodinámica, alerones del. y tras., motor, electrónica, chasis, suspensión, neumáticos, seguridad, volante), con nivel 0-10, coste por punto y compra inmediata; sin presupuesto o al máximo, no se puede comprar.
- **FR-003**: Las categorías DEBE aplicarlas el juego a los stats efectivos de mis dos coches de carrera (aero/alas→aerodinámica; motor/electrónica→motor; chasis/suspensión/neumáticos→chasis; seguridad/volante→fiabilidad), respetando el tope de calidad por stat.
- **FR-004**: Mi coche DEBE empezar por debajo de la media de los rivales, para que el desarrollo sea el camino de progreso.
- **FR-005**: El juego DEBE generar 9 equipos rivales (2 pilotos cada uno) con nombres de piloto únicos, stats en rangos establecidos (más rápidos y más lentos que otros) y colores distintos.
- **FR-006**: El jugador DEBE poder regenerar la parrilla de rivales con confirmación previa; la regeneración NO toca mi equipo, mis pilotos, mis desarrollos ni mi presupuesto.
- **FR-007**: El jugador DEBE poder editar los nombres de los equipos y pilotos rivales, y ver el nivel medio de sus coches.
- **FR-008**: La parrilla de salida DEBE ordenarse por ritmo esperado (combinación de piloto y coche) con separación inicial entre coches.
- **FR-009**: La plantilla completa (mi equipo + rivales + desarrollos) DEBE persistir en el navegador y sobrevivir recargas; un guardado corrupto DEBE regenerar la parrilla sin arrastrar la economía.

### Entidades clave

- **Plantilla (roster)**: mi equipo + 9 rivales, con la versión del formato para migrar guardados viejos.
- **Equipo**: nombre, color y presupuesto (el mío es la referencia visual y el color; el de los rivales, adversario).
- **Piloto**: nombre y sus 5 números (ritmo, consistencia, agresividad, habilidad en mojado, tolerancia al riesgo).
- **Coche**: aerodinámica, motor, chasis, fiabilidad; el mío lleva encima los niveles de desarrollo.
- **Desarrollo del coche**: niveles 0-10 por cada una de las 9 categorías, solo en mi equipo.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: Identidad y desarrollos sobreviven a recargas sucesivas el 100 % de las veces.
- **SC-002**: Cada punto de desarrollo comprado sube el stat efectivo correspondiente de mis coches hasta el tope; nunca por encima.
- **SC-003**: Tras "Generar parrilla nueva" (aceptada), los 9 equipos rivales cambian y mi equipo y presupuesto quedan idénticos.
- **SC-004**: En la salida, el orden de la parrilla coincide con el ritmo esperado calculado de cada coche (mejores delante).

## Supuestos

- Especificación retrospectiva: los rangos y costes exactos (coste por punto, tope por stat, rangos de stats rivales) viven en el plan, no aquí.
- El presupuesto y su contabilidad son de la spec 004; aquí solo se gasta en desarrollo.
- El efecto de los stats en el ritmo de carrera lo define el motor (spec 001).
- Todo en español (Constitución IV).
