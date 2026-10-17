# Plan de implementación: Partidas múltiples

**Rama**: `013-partidas-multiples` | **Fecha**: 2026-10-17 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de la función en `specs/013-partidas-multiples/spec.md`

## Resumen

3 ranuras de partida (A/B/C) con nombre, resumen y botones Crear/Jugar/Borrar (con confirmación), pantalla nueva "Partidas" accesible desde Mi Equipo. Cada ranura guarda su equipo y su carrera en claves propias de localStorage; la partida activa decide qué carga todo el juego. Migración automática v1 → ranura A. La nube sube las 3 ranuras y la activa en un documento por usuario (con migración del formato viejo).

## Contexto técnico

**Lenguaje/Versión**: TypeScript, sin dependencias nuevas.

**Dependencias principales**: roster.ts y career.ts siguen siendo la única fuente de verdad del CONTENIDO; solo cambia la clave de guardado (por ranura activa). El motor, las pantallas de carrera/temporada y la economía no se tocan.

**Almacenamiento**: claves nuevas por ranura (`f1manager:roster:a`…, `f1manager:career:a`…), `f1manager:active-slot` y `f1manager:slots-meta` (nombres). Las claves v1 (`f1manager:roster:v1`, `f1manager:career:v1`) se mueven a la ranura A en el arranque y desaparecen. Firestore: mismo documento `f1manager/{uid}` con `{ slots: { a: {career, roster, name}, … }, active }`; el formato viejo `{career, roster}` se lee como ranura A.

**Testing**: build + harness (intactos) + verificación en vivo por CDP (crear/renombrar/jugar/borrar con confirmación capturada, independencia de datos, migración v1 sembrada).

**Plataforma objetivo**: navegador.

**Objetivos de rendimiento**: sin cambios (leer una clave más al arrancar).

**Restricciones**: no puede haber pérdida de la partida existente bajo ningún flujo (migración primero, borrado solo con confirmación).

**Escala/Alcance**: 3 ranuras fijas; un documento de nube por usuario.

## Números (viven aquí)

| Concepto | Valor |
|---|---|
| Ranuras | 3: `a`, `b`, `c` (identificadores estables) |
| Nombre por defecto | "Partida 1" / "Partida 2" / "Partida 3" |
| Longitud máxima del nombre | 24 caracteres (recortado) |
| Claves | `f1manager:roster:{a\|b\|c}` · `f1manager:career:{a\|b\|c}` · `f1manager:active-slot` · `f1manager:slots-meta` |
| Confirmación de borrado | `window.confirm` con el nombre de la partida |
| Ranura activa tras borrar la activa | primera con contenido; si no hay, `a` (se creará al jugar) |
| Documento nube | `f1manager/{uid}` = `{ slots: { a: {career, roster, name}, … }, active }` |

## Constitution Check

| Principio / lección | Estado | Nota |
|---|---|---|
| I. Spec antes que código | ✔ | Spec aprobada (decisión: 3 ranuras, un doc de nube, migración a A) |
| II. Privacidad | ✔ | Nada personal |
| III. Sin dependencias | ✔ | localStorage + Firestore ya existente |
| IV. Móvil primero | ✔ | Tarjetas de ranura en columna en pantallas estrechas |
| V. Se entiende sin explicación | ✔ | Crear/Jugar/Borrar con la activa marcada |
| VI. No perder datos | ✔ | Migración primero y conservadora; borrado solo con confirmación; nube migra el formato viejo |
| VII. Requisito comprobable | ✔ | quickstart con flujos en vivo |
| VIII. Todo en mi carpeta | ✔ | specs/ y código en el repo |
| IX. Evidencias | ✔ | CDP: alternancia sin mezcla, crear/renombrar/borrar, migración v1 |
| L1/L2 | ✔ | N/A |

**Puerta: PASA.**

## Estructura del proyecto

### Documentación (esta función)

```text
specs/013-partidas-multiples/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── checklists/requirements.md
```

### Código fuente y puntos de contacto

```text
src/slots.ts (nuevo)       # Ranuras: ids, activa, nombres, claves por ranura,
                           # existencia, borrado y migración v1 -> A
src/slots-screen.ts (nuevo)# Pantalla Partidas: 3 tarjetas (nombre editable,
                           # resumen, Crear/Jugar/Borrar con confirmación)
src/slots-screen.css (nuevo)
src/storage-keys.ts        # Claves v1 quedan solo como origen de la migración
src/roster.ts              # saveRoster/loadRoster usan la clave de la ranura activa
src/career.ts              # saveCareer/loadCareer ídem
src/cloud.ts               # Push/pull del documento con las 3 ranuras + activa
                           # (formato viejo se lee como ranura A)
src/team-screen.ts         # Botón "Partidas" en la cabecera
src/main.ts                # showSlotsScreen + migración al arrancar
```

## Seguimiento de complejidad

> Sin entradas: no hay violaciones que justificar.
