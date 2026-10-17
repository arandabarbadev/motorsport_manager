# Especificación de la función: Asfalto libre

**Rama de la función**: `014-asfalto-libre`

**Creada**: 2026-10-17

**Estado**: Borrador

**Entrada**: Descripción del usuario: "en carrera en el circuito se ve la línea como el scalextric, pues quiero que no se vea y el coche se mueva por toda la pista."

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Sin raíl en el asfalto (Prioridad: P1)

Como jugador quiero que el circuito NO muestre la línea central que lo recorre de punta a punta, para que el asfalto sea asfalto y no parezca un circuito de scalextric con su raíl.

**Por qué esta prioridad**: es la mitad literal de la petición ("que no se vea"); mientras exista, el ojo sigue el raíl y los coches parecen enganchados aunque se muevan.

**Prueba independiente**: en carrera, a lo largo de toda la vuelta el eje del trazado es asfalto del mismo color que el resto de la calzada; no hay ninguna línea que lo recorra (en tema claro y en oscuro).

**Escenarios de aceptación**:

1. **Dado** una carrera en marcha en tema oscuro, **cuando** miro el circuito, **entonces** no hay línea central: solo borde, asfalto y línea de meta.
2. **Dado** el tema claro, **cuando** miro el circuito, **entonces** tampoco hay línea central.
3. **Dado** la línea de meta, **cuando** paso por ella, **entonces** sigue ahí (seguir distinguiendo dónde empieza la vuelta no es "raíl").

---

### Historia de usuario 2 - Coches por toda la pista (Prioridad: P1)

Como jugador quiero que los coches recorran el ANCHO COMPLETO de la calzada —rozando bordes, buscando huecos, abriéndose en las batallas— para que la pista se vea viva y aprovechada, no un carril único.

**Por qué esta prioridad**: es la otra mitad de la petición ("que el coche se mueva por toda la pista"); quitar la línea sin ampliar el recorrido dejaría el problema a medias.

**Prueba independiente**: en carrera, la distancia de los coches al eje del trazado es casi siempre notable y alcanza valores cercanos al semiancho de la calzada; ningún coche circula estable pegado al eje ni vuelca fuera del asfalto.

**Escenarios de aceptación**:

1. **Dado** recta sin tráfico cerca, **cuando** un coche la recorre, **entonces** deriva de lado a lado del asfalto (no vuelve al eje en cuanto puede).
2. **Dado** una curva, **cuando** los coches la toman, **entonces** se echan claramente al interior, hasta cerca del borde.
3. **Dado** una batalla, **cuando** dos coches ruedan juntos, **entonces** se abren a lados opuestos ocupando casi el ancho entre ambos.
4. **Dado** bandera amarilla, **cuando** el campo pasa, **entonces** se ordenan en fila (protocolo) — seguir la norma no es ir "por toda la pista".
5. **Dado** cualquier momento, **cuando** un coche va al límite lateral, **entonces** sigue pisando asfalto (se permite rozar, no volar fuera de forma estable).

### Casos límite

- ¿El motor se entera? No: el recorrido lateral sigue siendo cosmético (solo render); posiciones, huecos y adelantamientos intactos.
- ¿Y la amarilla/boxes/DNF? La amarilla ordena como hasta ahora; boxes y DNF se pintan igual (atenuados/fantasma).
- ¿Pista más ancha = trazado ilegible? El ensanche es moderado y se verifica por captura: el borde sigue marcando el circuito en ambos temas.
- ¿Coches más pequeños = no verlos? Se afilan en la misma proporción en que se ensancha la calzada; el radio mínimo y los anillos de sucesos se adaptan solos.
- ¿Partidas guardadas? Nada persistido cambia: la mejora es visual y aplica a cualquier evento ya en curso o nuevo.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El circuito NO debe dibujar línea central guía en ningún tema; el borde de calzada y la línea de meta DEBEN conservarse.
- **FR-002**: Los coches DEBEN recorrer todo el ancho de la calzada (deriva, trazada a las curvas y batallas más amplias), de forma suave y continua y SIN cambios en el motor; en bandera amarilla DEBEN mantener el orden en fila actual.
- **FR-003**: La proporción entre ancho de calzada, tamaño de coche y recorrido lateral máximo DEBE dejar el recorrido dentro del asfalto (rozar el borde, sí; circular estable fuera, no).

### Entidades clave

- **Trazada lateral** (render, existente): mismos componentes (deriva + curva + batalla), amplitudes ampliadas.
- **Calzada** (render, existente): ensanche moderado del trazo y eliminación de la línea central.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: En carrera, el canvas no contiene píxeles del raíl central (muestreo por color del composite de la vieja línea, tema oscuro y claro) y el eje del trazado es asfalto.
- **SC-002**: Muestreando los píxeles de coche contra el eje del trazado: casi la totalidad a > 6 px del eje y máximos ≥ 26 px (uso real del ancho en un lienzo de 940 px de lado menor), sin convivencia estable fuera del asfalto.
- **SC-003**: `npm run build` verde y `npm run harness` sin regresión (motor intacto; invariantes de la lateral siguen pasando).
- **SC-004**: Capturas en vivo en tema oscuro y claro mostrando asfalto limpio y coches repartidos (incluida la parrilla a dos columnas).

## Supuestos

- "Que no se vea" la línea se refiere a la guía central pintada, no al borde del circuito ni a la meta.
- "Por toda la pista" admite el protocolo de amarilla (fila) como excepción consciente del jugador.
- El ensanche de calzada y el afinado del coche son proporcionales y moderados: no se rediseña el trazado ni sus generadores.
