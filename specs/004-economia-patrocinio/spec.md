# Especificación de la función: Economía, patrocinio y sede

**Rama de la función**: `004-economia-patrocinio`

**Creada**: 2026-10-10

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Una economía persistente: cobro premios por resultado en cada carrera, firmo hasta 5 patrocinadores de una lista de 100 (los mejores exigen resultados), contrato personal en la sede que abarata y mejora las cosas, y veo la contabilidad de cada carrera. Con reinicio total cuando quiero empezar de cero." Especificación retrospectiva (Fase 4 + extensiones de las fases 6-7).

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Cobro por correr (Prioridad: P1)

Como jugador quiero que cada carrera termine en un ingreso claro —premios por posición de mis dos coches más patrocinio menos gastos— con el desglose a la vista, para decidir dónde invertir.

**Por qué esta prioridad**: sin economía no hay gestión: el dinero convierte los resultados en decisiones.

**Prueba independiente**: terminar una carrera: el panel muestra premios, patrocinio, sueldos, alquiler y balance, y el presupuesto queda actualizado.

**Escenarios de aceptación**:

1. **Dado** la carrera terminada, **cuando** se cierra el resultado, **entonces** cada uno de mis dos coches cobra según su posición (mejor puesto, más dinero) y el total premios es la suma.
2. **Dado** patrocinadores firmados y gastos fijos, **cuando** se hace caja, **entonces** el balance resta sueldos de pilotos, sueldos del personal y alquiler, y el número final es el que entra en el presupuesto.
3. **Dado** el panel de resultados, **cuando** lo leo, **entonces** veo cada partida del balance con su signo y el presupuesto resultante.
4. **Dado** una carrera ya contabilizada esta temporada, **cuando** se vuelve a correr (repetición), **entonces** no cobra ni se registra dos veces, y la temporada no se queda atascada.

---

### Historia de usuario 2 - Patrocinio que crece conmigo (Prioridad: P1)

Como jugador quiero una lista de 100 patrocinadores donde los mejores pagan más pero exigen mejores resultados, y poder llevar hasta 5 firmados a la vez, para que el medio tabla tenga recorrido.

**Por qué esta prioridad**: es el ingreso que crece con el progreso: sin escalera de patrocinadores, la economía es plana.

**Prueba independiente**: sin carreras corridas solo puedo firmar los peores; tras una buena carrera se desbloquean mejores.

**Escenarios de aceptación**:

1. **Dado** la lista de patrocinadores (mejor pagados primero), **cuando** la recorro, **entonces** cada uno muestra su pago por carrera y el puesto que exige para firmar.
2. **Dado** el inicio de temporada sin resultados, **cuando** miro los botones, **entonces** solo los que no exigen nada se pueden firmar; el resto muestran el puesto que piden.
3. **Dado** mi mejor resultado de la temporada, **cuando** iguala o supera lo que un patrocinador exige, **entonces** su botón se abre ("Firmar").
4. **Dado** 5 patrocinadores firmados, **cuando** quiero un sexto, **entonces** los botones dicen "Completo" hasta que quito uno.
5. **Dado** un patrocinador firmado, **cuando** lo quito, **entonces** deja de cobrarse desde la siguiente carrera.
6. **Dado** mi equipo de comerciales de la sede, **cuando** se calcula el ingreso, **entonces** cobra un poco más por cada nivel (spec de la sede, misma spec).

---

### Historia de usuario 3 - Sede y personal (Prioridad: P2)

Como jugador quiero invertir en la sede —mecánicos, ingenieros y comerciales— con niveles y costes crecientes, para elegir entre mejorar el coche (spec 003) o mejorar el negocio.

**Por qué esta prioridad**: es la segunda rueda de la economía; el coche ya da la primera decisión de gasto.

**Prueba independiente**: subir un nivel de personal y ver su efecto en el sitio que toca (boxes más rápidos en carrera, desarrollo más barato, patrocinio mayor).

**Escenarios de aceptación**:

1. **Dado** la pestaña de sede, **cuando** la abro, **entonces** veo los tres tipos de personal con su nivel (1-5), lo que aporta en el nivel actual y el coste de subir.
2. **Dado** presupuesto suficiente, **cuando** subo un nivel, **entonces** se cobra al momento y el efecto mostrado se actualiza.
3. **Dado** nivel máximo, **cuando** miro el botón, **entonces** dice "MÁX" y no compra más.
4. **Dado** los mecánicos subidos, **cuando** mis coches paran en boxes, **entonces** la parada dura menos (por nivel).
5. **Dado** los ingenieros subidos, **cuando** compro desarrollo del coche, **entonces** cada punto me sale más barato (por nivel).

---

### Historia de usuario 4 - Empezar de cero cuando yo quiera (Prioridad: P3)

Como jugador quiero un reinicio total con confirmación que detalla lo que se pierde, para rehacer la partida sin desinstalar nada.

**Por qué esta prioridad**: es la red de seguridad de la economía; sin ella, un arranque mal jugado condena la partida.

**Prueba independiente**: pulsar Reiniciar, aceptar: presupuesto y niveles vuelven al inicio; los nombres de mi equipo quedan.

**Escenarios de aceptación**:

1. **Dado** el botón de reinicio, **cuando** lo pulso, **entonces** pide confirmación enumerando lo que se reinicia (dinero, patrocinadores, desarrollos, sede, temporada).
2. **Dado** la confirmación aceptada, **cuando** se aplica, **entonces** todo vuelve a sus valores iniciales, salvo los nombres de mi equipo y pilotos y la parrilla de rivales.

---

### Casos límite

- ¿Presupuesto en números rojos? Puede ocurrir si los gastos superan los ingresos: se sigue jugando, pero no se puede comprar nada hasta remontar.
- ¿Patrocinador exigente firmado y luego mala temporada? Lo firmado sigue firmado: la exigencia es para firmar, no para mantener.
- ¿Quitar todos los patrocinadores? El ingreso por patrocinio es cero; la carrera solo deja premios menos gastos.
- ¿Carrera repetida tras el reinicio de temporada? Cada temporada empieza sin resultados: los desbloqueos vuelven a medirse con los resultados nuevos.
- ¿Cerrar la app justo al terminar una carrera? El premio se registra y se guarda de una vez con el resultado; al volver, está.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El juego DEBE pagar premios por la posición final de CADA uno de mis dos coches (mejor puesto, más dinero) y sumarlos al presupuesto exactamente una vez por carrera registrada.
- **FR-002**: Al terminar una carrera, el juego DEBE mostrar y aplicar el balance: premios + ingreso de patrocinio − sueldos de pilotos − sueldos del personal − alquiler de instalaciones.
- **FR-003**: El juego DEBE ofrecer 100 patrocinadores con pagos por carrera crecientes (de ~0,5 a ~5 M€) y una exigencia de resultado creciente (del último puesto al primero); hasta 5 firmados a la vez, firmables y quitables libremente.
- **FR-004**: Un patrocinador DEBE desbloquearse cuando mi mejor resultado de la temporada actual es igual o mejor que su exigencia; sin resultados, solo los que no exigen nada.
- **FR-005**: La sede DEBE tener tres tipos de personal (mecánicos, ingenieros, comerciales) con niveles 1-5, coste de subida creciente con el nivel, y efectos por nivel: paradas en boxes más rápidas, desarrollo del coche más barato y mayor ingreso de patrocinio.
- **FR-006**: El reinicio total DEBE pedir confirmación detallando qué se pierde, y DEBE conservar los nombres de mi equipo/pilotos y la parrilla de rivales.
- **FR-007**: Una carrera ya registrada esta temporada NO debe cobrar ni registrarse dos veces, y el progreso de la temporada no puede quedarse bloqueado por repetirla.
- **FR-008**: La economía DEBE persistir en el navegador y migrar guardados antiguos (p. ej., del patrocinador único a la lista de hasta 5) sin perder el dinero.

### Entidades clave

- **Economía de carrera**: presupuesto, temporada y progreso, personal de sede y patrocinadores firmados (la parte de temporada se detalla en la spec 005).
- **Patrocinador**: nombre, pago por carrera y puesto exigido para firmarlo.
- **Personal de sede**: nivel 1-5 por tipo (mecánicos, ingenieros, comerciales) con su coste y su efecto.
- **Balance de carrera**: premios, ingreso de patrocinio, y los tres gastos fijos, con el neto.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: El balance mostrado en el panel coincide con el cambio real del presupuesto, en cada carrera.
- **SC-002**: Ninguna carrera cobra premios dos veces, incluidas las repeticiones y los cierres a mitad de resultados.
- **SC-003**: Tras mejorar mi mejor resultado de la temporada, los patrocinadores que exigen ese puesto o menos aparecen firmables de inmediato.
- **SC-004**: Tras el reinicio total, presupuesto, personal, patrocinadores, desarrollos y temporada vuelven a sus valores iniciales; nombres y rivales quedan igual.

## Supuestos

- Especificación retrospectiva: los importes exactos (tabla de premios, sueldos, costes de sede) viven en el plan; los aprobó Rafa como valores iniciales a reajustar jugando.
- El calendario y el campeonato son de la spec 005; aquí la economía.
- Los efectos de mecánicos/ingenieros se aplican donde viven las paradas (spec 001/002) y el desarrollo (spec 003); esta spec los define y los paga.
- Todo en español (Constitución IV).
