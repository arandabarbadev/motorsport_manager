---
description: "Lista de tareas de la función Mi Equipo y la parrilla de rivales"
---

# Tareas: Mi Equipo y la parrilla de rivales

**Entrada**: documentos de `/specs/003-equipo-rivales/`

**Requisitos previos**: plan.md ✔, spec.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: lectura de código citada + verificación viva con datos sembrados. Sin código nuevo.

## Convención de rutas: src/ (roster.ts, names-data.ts, team-screen.ts, race-builder.ts, storage-keys.ts)

---

## Fase 1: Mi equipo (identidad y persistencia)

- [x] T001 Verificar en `src/team-screen.ts:218-262`: nombre de equipo, color y nombres de pilotos editables con guardado en cada cambio; campo vaciado restaura el valor anterior (FR-001)
- [x] T002 Verificar en `src/roster.ts:44-59,133-162`: creación del equipo jugador (350 M€, coche base 65/65/65/80, desarrollos a 0) y guardado completo en `f1manager:roster:v1` (FR-001, FR-009, FR-004)

## Fase 2: Desarrollo del coche

- [x] T003 Verificar en `src/roster.ts:21-54` y `src/team-screen.ts:264-297`: 9 categorías con etiquetas en español, nivel máx 10, coste por punto con descuento de ingenieros, botones "MÁX" y deshabilitado sin presupuesto (FR-002)
- [x] T004 Verificar en `src/race-builder.ts:23-67`: plegado de categorías sobre los 4 stats (aero+alerones→aero; motor+electrónica→engine; chasis+suspensión+neumáticos→chassis; seguridad+volante→reliability) con topes 95/99, aplicado a mis DOS coches; rivales sin bonus (FR-003)

## Fase 3: Rivales

- [x] T005 Verificar en `src/roster.ts:74-130` y `src/names-data.ts`: 9 rivales generados, nombres de piloto únicos (50 intentos, fallback numerado), stats en los rangos del plan, colores de paleta (FR-005)
- [x] T006 Verificar en `src/team-screen.ts:347-408`: regeneración con confirmación que avisa de la pérdida de nombres editados; nombres de equipo/piloto rivales editables y medias de coche visibles (FR-006, FR-007)
- [x] T007 Verificar en `src/roster.ts:165-173`: `regenerateRivals` conserva la entrada del jugador (identidad + desarrollos) tal cual (FR-006, SC-003)

## Fase 4: Robustez y orden de salida

- [x] T008 Verificar en `src/roster.ts:181-202`: carga con validación de forma y migración (desarrollos ausentes → 0); guardado inválido → plantilla nueva; la economía vive en otra clave (FR-009)
- [x] T009 Verificar en `src/race-builder.ts:19-20,69-99`: orden de salida por ritmo esperado (60 % piloto + 40 % coche, mismos pesos que el motor) con parrilla escalonada (FR-008, SC-004)

## Fase 5: Validación en vivo (2026-10-10, build de producción + Chrome headless)

- [x] T010 Plantilla sembrada respetada: el equipo abrió con presupuesto 350 M y botón "Carrera · R1: Melbourne" (Mi Equipo + calendario de la spec 005 funcionando juntos)
- [x] T011 Carrera viva pintando ESTA plantilla: 20 coches en la clasificación y en pista con sus colores (captura mm-race.png); la compra de niveles queda verificada en código (T003-T004) y jugada por Rafa de forma habitual

---

## Dependencias y orden

- Fases 1-4 por código en paralelo; Fase 5 al final

## Estrategia

Verificar en código citando archivo y línea y validar la plantilla en vivo con datos sembrados (IX). No genera cambios.

## Notas

- "Verificar" = leer el código citado, probarlo si hace falta y marcar. No genera cambios.
