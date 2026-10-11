---
description: "Lista de tareas de la función Cuenta y sincronización"
---

# Tareas: Cuenta y sincronización

**Entrada**: documentos de `/specs/006-cuenta-sincronizacion/`

**Requisitos previos**: plan.md ✔, spec.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: verificación viva (modo local) + lectura de código; con cuenta real (⭐) lo juega Rafa. Sin código nuevo.

## Convención de rutas: src/ (auth-screen.ts, cloud.ts, main.ts, team-screen.ts, firebase-config.example.ts)

---

## Fase 1: Modo local

- [x] T001 Verificar en `src/auth-screen.ts:9-36,79-82`: botón "Continuar sin cuenta (solo este navegador)" que entra al juego completo; aviso claro cuando la nube no está configurada (FR-001)
- [x] T002 Verificar en `src/cloud.ts:12,22-34`: sin configuración todo es no-op y los módulos de nube no se cargan (modo 100 % local, arranque ligero)

## Fase 2: Entrar, registrarse, sesión

- [x] T003 Verificar en `src/auth-screen.ts:39-78`: entrar/registrarse con correo, Google en un clic, errores del proveedor pintados y botones rehabilitados (FR-002)
- [x] T004 Verificar en `src/main.ts:57-69`: la puerta espera la sesión restaurada (entra directo) o muestra la pantalla de entrada (FR-003)
- [x] T005 Verificar en `src/team-screen.ts:142-147` y `src/cloud.ts:72-76`: botón "Salir" solo con sesión; salir cierra y recarga a la pantalla de entrada (FR-007)

## Fase 3: Reglas de la nube

- [x] T006 Verificar en `src/cloud.ts:86-105`: al entrar se baja la copia; comparación por texto exacto → distinta: la nube gana, se aplica y UNA recarga; igual: nada; nube vacía: sube la local (FR-004, SC-003)
- [x] T007 Verificar en `src/cloud.ts:107-131`: subida agrupada con 800 ms de alto reprogramable; toda subida escribe la partida ENTERA; fallo de red → silencio y reintento en el siguiente cambio (FR-005, FR-006, SC-002)
- [x] T008 Verificar en `src/cloud.ts:49-70`: entrar/registrarse bajan/suben la partida como parte del propio flujo (la sesión nunca deja la partida a medias)

## Fase 4: Claves fuera del repo

- [x] T009 Verificar `git check-ignore -v src/firebase-config.ts` → ignorado (.gitignore:4); la plantilla `src/firebase-config.example.ts` está versionada y `tools/check-firebase-config.js` comprueba la configuración (FR-008)

## Fase 5: Validación en vivo (2026-10-10, build de producción + Chrome headless)

- [x] T010 Modo local vivo: la pantalla de entrada cargó (Firebase configurado, sin sesión) y el botón "Continuar sin cuenta" entró a Mi Equipo con la partida sembrada (puntos 1 y 12 del quickstart; captura mm-team.png)
- [x] T011 ⭐ (Rafa, con sus cuentas): registro/entrar, sesión restaurada, conflicto nube-local con una sola recarga y continuación en el móvil (puntos 4-11)

---

## Dependencias y orden

- Fases 1-4 por código en paralelo; Fase 5 al final

## Estrategia

Verificar en código citando archivo y línea, validar el modo local en vivo y dejar los flujos con cuenta real para Rafa (IX: lo automatizable, automatizado; el resto, a mano y anotado). No genera cambios.

## Notas

- "Verificar" = leer el código citado, probarlo si hace falta y marcar. No genera cambios.
