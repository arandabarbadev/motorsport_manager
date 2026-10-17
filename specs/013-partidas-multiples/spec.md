# Especificación de la función: Partidas múltiples

**Rama de la función**: `013-partidas-multiples`

**Creada**: 2026-10-17

**Estado**: Borrador

**Entrada**: Descripción del usuario: "3 partidas guardadas". Decisión de Rafa (2026-10-17): 3 ranuras con nombre, selección y borrado con confirmación, en local y en la nube (un único documento de Firestore por usuario con las 3 partidas); la partida actual migra sola a la ranura A.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Tres partidas con nombre (Prioridad: P1)

Como jugador quiero tener 3 partidas independientes, cada una con su nombre, su presupuesto y su temporada, para poder llevar a la vez (por ejemplo) una reconstrucción paciente, una temporada al límite y una partida de pruebas sin pisarse.

**Por qué esta prioridad**: es la petición entera; lo demás es que no rompa nada.

**Prueba independiente**: creo dos partidas con nombres distintos, avanzo en una, y la otra sigue intacta (dinero, ronda y resultado no se mezclan).

**Escenarios de aceptación**:

1. **Dado** el botón "Partidas" en Mi Equipo, **cuando** lo pulso, **entonces** veo las 3 ranuras: la activa marcada, cada una con su nombre editable y su resumen (temporada, ronda y presupuesto) o "Vacía".
2. **Dado** una ranura vacía, **cuando** pulso "Crear", **entonces** se convierte en la partida activa con un equipo nuevo (presupuesto inicial completo) y entro a jugar con ella.
3. **Dado** una ranura con partida, **cuando** pulso "Jugar", **entonces** pasa a ser la activa y todo el juego (equipo, sede, patrocinadores, campeonato, carrera) carga SUS datos.
4. **Dado** el nombre de una ranura, **cuando** lo edito, **entonces** se guarda al instante y así aparece en la pantalla de partidas.
5. **Dado** dos partidas con dinero y ronda distintos, **cuando** cambio de una a otra, **entonces** cada una conserva exactamente su estado (nada se mezcla ni se sobrescribe).

---

### Historia de usuario 2 - Borrar sin sustos (Prioridad: P1)

Como jugador quiero borrar una partida con una confirmación clara, para liberar la ranura sin perder por accidente una temporada entera.

**Por qué esta prioridad**: borrar es irreversible; el susto es peor que el trámite.

**Prueba independiente**: pido borrar una partida: sale una confirmación con su nombre; al aceptar, la ranura queda vacía y las demás intactas (si borro la activa, el juego pasa a una partida utilizable).

**Escenarios de aceptación**:

1. **Dado** una ranura con partida, **cuando** pulso "Borrar", **entonces** se me pide confirmación con el nombre de la partida antes de hacer nada.
2. **Dado** la confirmación rechazada, **cuando** respondo que no, **entonces** no se borra nada.
3. **Dado** la confirmación aceptada, **cuando** respondo que sí, **entonces** la ranura queda "Vacía" y las otras dos no cambian.
4. **Dado** la partida borrada que era la activa, **cuando** vuelvo al juego, **entonces** hay una partida activa utilizable (la primera con contenido, o una nueva si no queda ninguna).

---

### Historia de usuario 3 - La partida de siempre sigue ahí (Prioridad: P1)

Como jugador con partida guardada quiero que la actualización no me la toque, para seguir donde estaba sin reempezar.

**Por qué esta prioridad**: perder la partida existente sería el peor resultado posible del cambio.

**Prueba independiente**: entro con los guardados de la versión anterior: todo aparece en la ranura A, activa y con sus datos intactos.

**Escenarios de aceptación**:

1. **Dado** guardados de la versión anterior (sin ranuras), **cuando** abro el juego, **entonces** migran a la ranura A: equipo, dinero y temporada exactamente igual, y la ranura A es la activa.
2. **Dado** la migración hecha, **cuando** miro el almacenamiento, **entonces** ya no quedan los guardados viejos (no hay duplicados que puedan re-migrar).
3. **Dado** una instalación nueva sin guardados, **cuando** entro, **entonces** todo funciona como ahora: partida nueva directa en la ranura A, sin pantalla extra obligatoria.

---

### Historia de usuario 4 - Las 3 partidas en la nube (Prioridad: P2)

Como jugador con cuenta quiero que mis 3 partidas se guarden juntas en la nube como antes se guardaba una, para cambiar de dispositivo y encontrarlas todas.

**Por qué esta prioridad**: es la extensión natural del sync existente; el formato cambia pero la experiencia no.

**Prueba independiente**: con sesión iniciada, los guardados suben en un único documento por usuario que contiene las 3 ranuras y la activa; al entrar en otro dispositivo, se bajan tal cual.

**Escenarios de aceptación**:

1. **Dado** sesión iniciada, **cuando** el juego guarda, **entonces** sube un documento por usuario con las 3 ranuras (nombre, equipo y carrera de cada una) y cuál está activa.
2. **Dado** un documento de la nube con el formato viejo (una sola partida), **cuando** se baja, **entonces** esa partida pasa a ser la ranura A (misma migración que en local).
3. **Dado** modo sin cuenta / Firebase sin configurar, **cuando** juego, **entonces** todo funciona en local igual que ahora (las ranuras no dependen de la nube).

### Casos límite

- ¿Cambiar de partida a mitad de fin de semana? El cambio se hace desde Mi Equipo (nunca desde la carrera): la carrera en curso pertenece a su partida y al volver a ella sigue donde estaba (spec 011).
- ¿Borrar la partida activa en medio? La confirmación lo impide por descuido; tras borrar, la activa pasa a la primera ranura con contenido (o se crea nueva al entrar a jugar).
- ¿Nombres vacíos o largos? El nombre vacío vuelve al nombre por defecto ("Partida 1/2/3"); se recorta a 24 caracteres.
- ¿Dos pestañas abiertas? Igual que ahora: la última escritura gana (localStorage por pestaña, sin bloqueo).
- ¿Modo local y luego cuenta? Al iniciar sesión, la nube manda si difiere (comportamiento actual, ahora por las 3 ranuras).

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El juego DEBE ofrecer exactamente 3 ranuras de partida, cada una con equipo y carrera independientes y un nombre editable (por defecto "Partida 1/2/3"); una es la activa y todo el juego carga sus datos.
- **FR-002**: La pantalla de partidas DEBE permitir: ver el resumen de cada ranura (nombre, temporada, ronda, presupuesto o "Vacía"), crear en una vacía, jugar una existente (activándola) y borrar con confirmación que nombra la partida.
- **FR-003**: Borrar una ranura DEBE vaciar solo esa ranura; si era la activa, la activa pasa a la primera con contenido (o se creará una nueva al jugar); las demás no cambian.
- **FR-004**: Los guardados de la versión anterior DEBEN migrar automáticamente a la ranura A (activa) sin pérdida, y los guardados viejos desaparecen tras la migración.
- **FR-005**: La sincronización en la nube DEBE guardar las 3 ranuras y la activa en un único documento por usuario; los documentos con el formato viejo se interpretan como la ranura A; sin cuenta/Firebase, todo funciona en local.

### Entidades clave

- **Ranura de partida** (nueva): identificador estable (A/B/C), nombre, y sus guardados de equipo y carrera asociados.
- **Equipo / Carrera** (specs 001-011): sin cambios de contenido; su clave de guardado pasa a ser por ranura.
- **Documento de nube** (extensión): de `{equipo, carrera}` a `{ranuras: {a, b, c}, activa}` con migración del formato viejo.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: Dos partidas con dinero/ronda distintos conservan su estado al alternar entre ellas (verificado en vivo, sin mezcla).
- **SC-002**: Crear, renombrar y borrar (con confirmación aceptada y rechazada) hacen exactamente lo previsto, comprobado en vivo por almacenamiento y pantalla.
- **SC-003**: Con guardados v1 instalados, al abrir el juego aparecen como ranura A activa, intactos y sin duplicar (verificado en vivo).
- **SC-004**: El push de la nube serializa las 3 ranuras y la activa en un documento (comprobación de código/build; en vivo con sesión solo si hay Firebase configurado).

## Supuestos

- 3 ranuras es el número pedido; no hace falta scroll ni ranuras ilimitadas.
- El nombre de la partida es libre (sin unicidad): es una etiqueta, no un identificador.
- La entrada a las ranuras está en Mi Equipo; no se añade pantalla obligatoria al arrancar (la activa sigue siendo la última jugada).
