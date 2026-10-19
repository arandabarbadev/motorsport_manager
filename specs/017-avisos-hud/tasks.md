---
description: "Lista de tareas de la función Avisos en el HUD"
---

# Tareas: Avisos en el HUD

**Entrada**: documentos de `/specs/017-avisos-hud/`

**Requisitos previos**: spec.md ✔, plan.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: build + harness (sin regresión) + verificación en vivo por CDP (`mm-v017.js`, avería real con fiabilidad sembrada a 0).

## Convención de rutas: src/ (notices.ts nuevo, ui.css, race-screen.ts)

---

## Fase 1: El componente genérico

- [x] T001 `src/notices.ts` + `src/ui.css`: hub de avisos (pila, máx 4, ttl con fundido, kinds, pointer-events none) (FR-001, FR-002)

## Fase 2: La avería con nombre

- [x] T002 `src/race-screen.ts`: hub montado en `.track-wrap`; rama `mechanical` → aviso "Retirada por avería" con piloto y P# (FR-003, FR-004)

## Fase 3: Verificación y cierre

- [x] T003 `npm run build` verde y `npm run harness` sin regresión
- [x] T004 Verificación en vivo `mm-v017.js`: roster con reliability 0 → 20x → aviso real con nombre+P#, ≤4 apiladas, autodesaparición a los ~7 s, captura (SC-001, SC-002)
- [x] T005 Marcar requisitos y commit de la función

---

## Dependencias y orden

T001 → T002 → T003 → T004 → T005

## Estrategia

Primero el componente aislado (reutilizable), luego una sola línea de enganche en la rama que ya existe del evento mechanical, y al final la verificación en vivo con una avería REAL del motor acelerada sembrando el save.
