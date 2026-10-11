---
description: "Lista de tareas de la función Instalación, uso sin conexión y tema"
---

# Tareas: Instalación, uso sin conexión y tema

**Entrada**: documentos de `/specs/007-pwa-offline-tema/`

**Requisitos previos**: plan.md ✔, spec.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: verificación en vivo (build de producción + Chrome headless con red cortada) + lectura de código; instalación con el móvil (⭐). Sin código nuevo.

## Convención de rutas: public/ (sw.js, manifest.webmanifest, iconos), index.html, src/ (main.ts, theme.ts, team-screen.ts, race-screen.ts, screen-transition.ts)

---

## Fase 1: Manifiesto e instalación

- [x] T001 Verificar `public/manifest.webmanifest` + `index.html`: nombre "Motorsport Manager"/"F1 Manager", standalone, iconos 192/512 + 512 adaptable, theme-color, apple-touch-icon, idioma es, y el enlace del manifiesto en el HTML (FR-001)
- [x] T002 Verificar en `src/team-screen.ts:151-163`: botón "Instalar app" al capturar el aviso del navegador; diálogo nativo al pulsarlo; oculto si el navegador no lo ofrece (FR-001)

## Fase 2: Service worker

- [x] T003 Verificar en `public/sw.js:24-49`: navegaciones red-primero con revalidación (`no-cache`) y caída a caché solo sin conexión (FR-003, **L2**)
- [x] T004 Verificar en `public/sw.js:52-67`: assets con huella cache-first, se guardan al pedirarse con éxito (FR-002)
- [x] T005 Verificar en `public/sw.js:9-22`: versión de caché v3, `skipWaiting` y borrado de todas las cachés viejas al activar (FR-004)
- [x] T006 Verificar en `src/main.ts:75-79`: registro del fondo solo en la build de producción y sobre http/https (FR-005)

## Fase 3: Tema y transiciones

- [x] T007 Verificar en `src/theme.ts`: tema persistido ("f1manager:theme"), oscuro por defecto, botón en las cuatro pantallas y oyentes de cambio (FR-006)
- [x] T008 Verificar en `src/race-screen.ts:156-160`: la capa del circuito se repinta con los colores del tema al cambiarlo, sin tocar la carrera (FR-006, SC-004)
- [x] T009 Verificar en `src/screen-transition.ts`: fundido único (salida ~150 ms + entrada animada) para entrada, equipo, carrera y temporada (FR-007)

## Fase 4: Validación en vivo (2026-10-10, build de producción servida + Chrome headless)

- [x] T010 `npm run build` verde (8,4 s): la app de producción se empaqueta con su manifiesto, iconos y fondo (precondición de todo lo demás)
- [x] T011 Fondo registrado en vivo: `navigator.serviceWorker.getRegistration()` → `sw.js` activo tras la visita (punto 4 del quickstart)
- [x] T012 **Offline real verificado**: red cortada (`Network.emulateNetworkConditions offline`) y recarga → el juego abre y pinta la pantalla de entrada desde la caché (captura mm-offline.png); la partida sembrada seguía en el navegador (FR-002, FR-008, SC-002)
- [x] T013 ⭐ (Rafa, con el móvil): instalación en pantalla de inicio y apertura a pantalla completa (puntos 1-3); la publicación real de una versión nueva (puntos 7-8)

---

## Dependencias y orden

- Fases 1-3 por código en paralelo; Fase 4 al final (requiere la build)

## Estrategia

Verificar en código citando archivo y línea, validar offline en vivo con evidencia (IX), dejar la instalación y la publicación para el móvil de Rafa. No genera cambios.

## Notas

- "Verificar" = leer el código citado, probarlo si hace falta y marcar. No genera cambios.
- Este juego es el origen de la lección L2 (fondo v2, commit del 2026-10-04): la carcasa de mi-semana la heredó después.
