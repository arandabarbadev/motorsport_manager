# Especificación de la función: Economía dura

**Rama de la función**: `009-economia-dura`

**Creada**: 2026-10-11

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Subir el precio o bajar el presupuesto inicial. Poner más niveles de mejora en todo. Que cuanto más mejores, más caro sea la mejora. Añadir más patrocinadores y más firmas. Bajar el dinero que ganas con cada patrocinador (de 5 a 3): que sea más complicado comprar mejoras." Decisión de Rafa (2026-10-11): presupuesto inicial más bajo + precios crecientes; 150 patrocinadores y hasta 8 firmas; paga máxima 3 M€.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Cada nivel cuesta más que el anterior (Prioridad: P1)

Como jugador quiero que las mejoras encarezcan con cada nivel y que haya más niveles que alcanzar, para que decidir dónde gasto importe de verdad.

**Por qué esta prioridad**: es el corazón del ajuste pedido: sin coste creciente, "más niveles" es solo más de lo mismo.

**Prueba independiente**: mirar el precio de una categoría subiendo niveles: cada botón cuesta más que el anterior.

**Escenarios de aceptación**:

1. **Dado** una categoría de desarrollo a nivel 0, **cuando** miro su botón, **entonces** el precio del nivel 1 es el base, y cada nivel siguiente cuesta más que el anterior (hasta el nivel máximo).
2. **Dado** el nivel máximo de desarrollo, **cuando** lo alcanzo, **entonces** el botón dice "MÁX" (el máximo ha crecido: hay más recorrido).
3. **Dado** la sede, **cuando** subo personal, **entonces** cada nivel cuesta más que el anterior, hasta un máximo también más alto.
4. **Dado** mis ingenieros, **cuando** miro los precios de desarrollo, **entonces** el descuento se sigue aplicando sobre el precio creciente.

---

### Historia de usuario 2 - Arrancar con menos (Prioridad: P1)

Como jugador quiero empezar con menos presupuesto, para que las primeras carreras sean decisiones y no compras alegres.

**Por qué esta prioridad**: junto con los precios crecientes, es la palanca que aprieta el arranque (decisión de Rafa: ambas).

**Prueba independiente**: crear una partida nueva: el presupuesto inicial es el nuevo (200 M€), no el viejo.

**Escenarios de aceptación**:

1. **Dado** una partida nueva, **cuando** la abro, **entonces** el presupuesto inicial es 200 M€.
2. **Dado** una partida ya empezada, **cuando** entra la mejora, **entonces** su dinero no cambia (no se toca lo guardado; solo el reinicio total y las partidas nuevas usan el valor nuevo).
3. **Dado** el aviso del reinicio total, **cuando** lo leo, **entonces** menciona el valor nuevo.

---

### Historia de usuario 3 - Más patrocinio, peor pagado (Prioridad: P2)

Como jugador quiero una escalera de patrocinadores más larga (150) y más firmas a la vez (8), pero con pagos más bajos, para que el patrocinio acompañe y no regale.

**Por qué esta prioridad**: ajusta el ingreso para que el coste creciente se sienta; sin esto, la economía se endurece solo a medias.

**Prueba independiente**: abrir Patrocinadores: 150 en la lista, hasta 8 firmables, y el mejor pagado da 3 M€/carrera.

**Escenarios de aceptación**:

1. **Dado** la lista de patrocinadores, **cuando** la recorro, **entonces** hay 150, ordenados de mejor a peor pago, con exigencias de P1 a P20.
2. **Dado** la lista, **cuando** miro el mejor pagado, **entonces** paga 3 M€/carrera (antes 5); el peor, ~0,3.
3. **Dado** sin firmar ninguno, **cuando** quiero firmar, **entonces** puedo llevar hasta 8 a la vez (antes 5), y el resumen cuenta sobre 8.
4. **Dado** patrocinadores firmados de la partida vieja, **cuando** entra la mejora, **entonces** siguen firmados (sus ids siguen siendo válidos).

---

### Casos límite

- ¿Partida vieja con dinero por encima de lo que costaría el viejo nivel 10? No pasa nada: sus niveles y dinero se conservan; los precios nuevos aplican a las compras siguientes.
- ¿Niveles por encima del máximo nuevo? Imposible: los máximos solo suben (10→15 y 5→10).
- ¿El cap de stats del coche con más niveles? No cambia: el tope efectivo sigue igual; las categorías emparejadas (p. ej. aero+alerones) bastan justas para llegar al tope al nivel máximo de ambas.
- ¿Ingreso menor con 8 firmas que antes con 5? No: más firmas compensan en número lo que baja cada pago; el neto queda parecido o algo menor, que es la intención.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El coste de cada nivel de mejora (desarrollo del coche y personal de sede) DEBE crecer con el nivel, mostrando siempre el precio del siguiente nivel en el botón.
- **FR-002**: El número máximo de niveles DEBE crecer en desarrollo del coche y en personal de sede (más recorrido de progresión), manteniendo el tope de calidad del coche.
- **FR-003**: Las partidas nuevas y el reinicio total DEBEN usar el presupuesto inicial nuevo (200 M€); las partidas guardadas conservan su dinero.
- **FR-004**: La escalera de patrocinadores DEBE crecer a 150, con pagos decrecientes desde 3 M€/carrera (máximo) hasta ~0,3 (mínimo) y exigencias de resultado de P1 a P20.
- **FR-005**: El número de patrocinadores firmables a la vez DEBE subir a 8, en la lista y en el resumen, sin perder los ya firmados.
- **FR-006**: El descuento de ingenieros y el bonus de comerciales DEBEN seguir aplicándose sobre los precios e ingresos nuevos.

### Entidades clave

- Cambios de valores, no de entidades: desarrollo (más niveles, coste creciente), personal de sede (más niveles), patrocinador (más unidades, pagos nuevos), economía de carrera (presupuesto inicial nuevo).

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: En una partida nueva, subir una categoría de nivel 1 a nivel 2 cuesta exactamente el doble (o más) que de 0 a 1; cada nivel siguiente, más que el anterior.
- **SC-002**: El catálogo de patrocinadores lista 150 entradas; el máximo pago visible es 3 M€ y el resumen cuenta "n/8".
- **SC-003**: Una partida nueva arranca con 200 M€; una partida guardada conserva su presupuesto tras la actualización.
- **SC-004**: Comprar una mejora resta del presupuesto exactamente el precio mostrado en el botón.

## Supuestos

- Valores decididos por Rafa el 2026-10-11 (AskUser): 200 M€ inicial, 150/8 patrocinadores, paga máx. 3; precios crecientes con los números del plan.
- Los premios de carrera y los gastos fijos NO cambian en esta función (solo el lado del gasto y del patrocinio).
- El calendario no cambia aquí (specs 010-011).
