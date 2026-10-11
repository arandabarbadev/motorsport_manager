# Especificación de la función: Dorsales visibles y guía de primera vez

**Rama de la función**: `008-numeros-y-guia`

**Creada**: 2026-10-10

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Con 20 puntos de colores en pantalla, diferenciar equipos solo por color falla para daltonismo (≈1 de cada 12 hombres) — añade un número o inicial encima de cada punto, no solo color. Y un breve tutorial o tooltip la primera vez que se abre cada pantalla (Mi Equipo, Boxes, Patrocinadores): con cuatro sistemas económicos a la vez, un jugador nuevo se pierde sin guía."

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Cada coche, identificable sin color (Prioridad: P1)

Como jugador daltónico quiero que cada coche lleve un dorsal visible sobre el punto, para seguir MIS coches y a los rivales sin depender del color.

**Por qué esta prioridad**: hoy el juego es injugable para quien no distingue los colores: es una barrera de acceso, no un capricho.

**Prueba independiente**: en carrera, mirar cualquier punto: lleva su número; la tabla de clasificación también.

**Escenarios de aceptación**:

1. **Dado** la carrera en curso, **cuando** miro cualquier coche en pista, **entonces** lleva un dorsal pequeño y legible encima del punto, con contraste suficiente sobre cualquier color de equipo y fondo.
2. **Dado** la tabla de clasificación, **cuando** miro una fila, **entonces** veo el dorsal además del color del equipo.
3. **Dado** un piloto, **cuando** corre en varias carreras, **entonces** su dorsal es siempre el mismo (dentro de la partida).
4. **Dado** los 20 coches, **cuando** los cuento, **entonces** hay 20 dorsales distintos (1-20).

---

### Historia de usuario 2 - La primera vez, alguien me explica (Prioridad: P2)

Como jugador nuevo quiero una guía breve la primera vez que abro cada pantalla clave (Mi Equipo, Carrera/Boxes, Patrocinadores), para saber qué decidir y con qué dinero.

**Por qué esta prioridad**: con desarrollo, sede, patrocinio y finanzas a la vez, sin guía el jugador nuevo abandona; el dorsal era urgente, esto retiene.

**Prueba independiente**: borrar la marca de guía y abrir Mi Equipo: aparece la tarjeta con 3-4 ideas y un botón para cerrarla; no vuelve a aparecer.

**Escenarios de aceptación**:

1. **Dado** la primera visita a una pantalla clave, **cuando** se abre, **entonces** aparece una tarjeta breve encima con lo esencial de esa pantalla (qué se hace aquí y con qué dinero) y un botón "Entendido".
2. **Dado** la tarjeta cerrada, **cuando** vuelvo a esa pantalla, **entonces** no vuelve a aparecer (ni tras recargar).
3. **Dado** otra pantalla clave, **cuando** se abre por primera vez, **entonces** tiene SU guía propia, no la misma.
4. **Dado** la guía, **cuando** la leo, **entonces** no bloquea el juego: se cierra con un clic/tap y no vuelve.

---

### Casos límite

- ¿Dorsal en móvil (puntos pequeños)? El dorsal escala con el punto y se mantiene legible; si no cabe, se agranda el punto lo justo.
- ¿Dos equipos con colores casi iguales? El dorsal resuelve la ambigüedad (era el problema de fondo).
- ¿Guía y pantalla de carrera arrancando de golpe? La guía de carrera espera a que la parrilla esté pintada; no compite con el semáforo.
- ¿Partida nueva en otro navegador? Las guías son por navegador (una vez por navegador), no por partida: no re-explican a quien ya sabe.
- ¿Modo oscuro y claro? Dorsal y tarjeta usan los colores del tema con contraste en ambos.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: Cada coche en carrera DEBE mostrar un dorsal (1-20) estable por piloto y partida, dibujado sobre el punto con contraste garantizado sobre el color del equipo y el fondo.
- **FR-002**: La tabla de clasificación DEBE mostrar el dorsal de cada piloto además del color de su equipo.
- **FR-003**: Los dorsales DEBEN asignarse al crear la plantilla y persistir con ella (los dos míos incluidos).
- **FR-004**: Las pantallas clave (Mi Equipo, Carrera/Boxes, Patrocinadores) DEBEN mostrar una guía breve y propia la primera vez que se abren, cerrable con un botón.
- **FR-005**: La guía DEBE mostrarse una sola vez por pantalla y navegador (marca persistente), sin repetirse tras recargar ni reabrir.

### Entidades clave

- **Dorsal del piloto**: número 1-20 que identifica al piloto en pista y tablas, asignado en la plantilla (spec 003) y visible en carrera (spec 002).
- **Guía de pantalla**: texto breve por pantalla clave con su marca de "ya vista" en el navegador.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: En una captura en escala de grises de la carrera, cada coche sigue identificable por su dorsal (prueba de daltonismo).
- **SC-002**: Los 20 dorsales en carrera coinciden con los de la tabla de clasificación y son estables entre carreras de la misma partida.
- **SC-003**: La guía aparece exactamente una vez por pantalla clave y navegador; cero repeticiones tras cerrar.

## Supuestos

- Los dorsales 1-20 se asignan al crear/regenerar la plantilla (los del jugador incluidos); no se editan a mano (no lo pidió nadie).
- Las guías son por navegador, no por partida ni por cuenta (re-explicar por partida sería pesado).
- Los textos de guía los redacta el desarrollo en español (Constitución IV); viven en el plan, no aquí.
