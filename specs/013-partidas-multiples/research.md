# Investigación: Partidas múltiples

**Fecha**: 2026-10-17 · **Spec**: [spec.md](spec.md)

## Punto de partida (lo que ya hay)

1. **Un solo juego guardado**: `roster.ts` y `career.ts` serializan a DOS claves fijas de localStorage (`f1manager:roster:v1`, `f1manager:career:v1`) definidas en `storage-keys.ts`. Toda pantalla llama a `loadRoster()/saveRoster()/loadCareer()/saveCareer()` sin parámetros: la firma ya es "la partida activa", solo falta que la clave lo sea.
2. **La creación por defecto ya es perezosa**: `team-screen` entra con `loadRoster() ?? createDefaultRoster()` y guarda; `getOrCreateCareer(fallback)` igual. Es decir, "ranura vacía → crear al entrar" ya funciona si la clave está vacía: el flujo Crear sale casi gratis (activar ranura + entrar a Mi Equipo).
3. **La nube guarda cadenas, no estructuras**: `cloud.ts` sube `{career: string, roster: string}` al documento `f1manager/{uid}`; el pull compara cadenas y recarga si difieren. Cambiar el sobre (3 ranuras) no toca el contenido de las cadenas: la migración es del formato del documento, no de los datos.
4. **La pantalla de equipo es el hub**: cabecera con Reiniciar/Instalar/Salir/Carrera. "Partidas" encaja ahí; el cambio de ranura SOLO se ofrece desde ahí (nunca desde la carrera), así la carrera en curso y su guardado no pueden pisarse (spec 011: el fin de semana se reanuda).
5. **window.confirm ya existe en el juego** (Reiniciar/temporada) y la verificación por CDP ya sabe capturarlo (`window.confirm = () => true`, truco del proyecto mi-semana).

## Opciones consideradas

### ¿Claves por ranura o un único blob con las 3?

- **Blob único** (`f1manager:saves` con las 3): un solo `JSON.parse`… pero reescribe TODO el estado en cada guardado parcial (una carrera escribiría también las otras dos ranuras) y obliga a tocar cada `saveCareer/saveRoster` para rehidratar el blob.
- **Clave por ranura (elegida)**: `f1manager:roster:{slot}` / `f1manager:career:{slot}`. `saveCareer` escribe SOLO la ranura activa — cero riesgo de pisar las demás, y `loadX()` mira solo la activa. El cambio en roster.ts/career.ts es de una línea cada uno (la constante por una función).

### ¿Dónde vive la ranura activa?

`f1manager:active-slot` + `f1manager:slots-meta` (nombres) como claves propias, gestionadas por el módulo nuevo `slots.ts`. Las pantallas siguen sin saber nada: piden `loadCareer()` y ya está. La nube sube también activa+nombres para que otro dispositivo abra la misma partida.

### ¿Pantalla obligatoria al arrancar?

No: la activa es la última jugada y el arranque va directo a Mi Equipo (la instalación nueva crea la ranura A sola, como ahora). La pantalla de partidas se abre con el botón "Partidas". Menos clics en el uso del día a día y flujo de estreno intacto.

### ¿Migración v1?

En el arranque (main.ts, antes de cualquier pantalla): si no existe `career:a` y sí `career:v1`, se MOVEN ambas claves v1 a `:a` y `active-slot = 'a'`. Mover (no copiar) evita re-migraciones y duplicados. Si `:a` ya existe, las v1 se ignoran (no se machaca lo jugado con versiones viejas). El pull de la nube aplica la misma idea: documento viejo `{career, roster}` = ranura A.

### ¿Cómo se comprueba la independencia sin jugar dos temporadas?

Sembrar en la verificación: a la ranura B se le escribe directamente un `career` con presupuesto distinto (p. ej. 123 M€ y ronda 5) por localStorage; al alternar A↔B y leer el chip de presupuesto de Mi Equipo, cada pantalla muestra SU valor y la otra clave no cambia. Es la comprobación de "no mezcla" sin correr carreras.

## Riesgos y mitigaciones

- **Pisar la ranura equivocada**: imposible por construcción — cada save escribe solo `roster/career:{activa}`; cambiar de ranura obliga a pasar por `setActiveSlot` (pantalla Partidas).
- **Carrera abierta al cambiar de ranura**: el cambio solo se ofrece en Mi Equipo; la pantalla de carrera guarda al terminar su acto (spec 011) y su `buildInitialState` es una instantánea — sin interferencia.
- **Borrar la activa**: tras borrar, la activa pasa a la primera con contenido; si no queda ninguna, Mi Equipo crea la A nueva (comportamiento ya existente).
- **Documento de nube mixto (un dispositivo viejo)**: el pull del formato viejo solo aplica si NO hay campo `slots`; si lo hay, manda siempre el nuevo. El push siempre escribe el nuevo formato.
