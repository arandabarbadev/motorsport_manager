---
description: "Lista de tareas de la función Asfalto libre"
---

# Tareas: Asfalto libre

**Entrada**: documentos de `/specs/014-asfalto-libre/`

**Requisitos previos**: plan.md ✔, spec.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: build + harness (sin regresión) + verificación en vivo por CDP (raíl ausente por color, dispersión lateral contra el eje reconstruido, ambos temas).

## Convención de rutas: src/ (racing-line.ts, race-screen.ts, ui.css)

---

## Fase 1: Amplitudes y geometría

- [x] T001 `src/racing-line.ts`: amplitudes ampliadas — deriva ±0,32 a 0,3 rad/s, curva ×0,8, batalla 0,9 (amarilla ×0,4, τ 0,45 s y ventana 0,0035 SIN cambios) (FR-002)
- [x] T002 `src/race-screen.ts`: calzada 6,2 % → 7,5 % del lado menor, radio de coche 1,6 % → 1,3 %, excursión lateral ±0,34 → ±0,42 del ancho (FR-002, FR-003)

## Fase 2: Adiós raíl

- [x] T003 `src/race-screen.ts` + `src/ui.css`: eliminar el trazo central (`strokeLoop(1.5, --track-line)`) y las variables `--track-line` de ambos temas; borde y meta intactos (FR-001)

## Fase 3: Verificación y cierre

- [x] T004 `npm run build` verde y `npm run harness` sin regresión (motor intacto + invariantes laterales)
- [x] T005 Verificación en vivo (CDP): sin píxeles del raíl (composite viejo, oscuro y claro), coches con casi totalidad de píxeles > 6 px del eje y máximos ≥ 26 px sin convivencia estable fuera del asfalto; parrilla a dos columnas; capturas en ambos temas (SC-001, SC-002, SC-004)
- [x] T006 Commit de la función

---

## Dependencias y orden

T001 → T002 → T003 → T004 → T005 → T006

## Estrategia

Primero las amplitudes (la matemática pura que ya tiene red de seguridad en el harness), luego la geometría que les hace sitio, y por último el borrado del raíl. El motor no se toca. Commit al final.
