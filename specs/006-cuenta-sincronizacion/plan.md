# Plan de implementación: Cuenta y sincronización

**Rama**: `006-cuenta-sincronizacion` | **Fecha**: 2026-10-10 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de la función en `specs/006-cuenta-sincronizacion/spec.md`

## Resumen

Plan retrospectivo **sin cambios de código**: login (correo/contraseña y Google), sesión restaurada, copia de seguridad en la nube por cuenta con regla "la nube gana al entrar" y subida agrupada, y modo local completo. Misma función que en mi-semana (spec 006 allí), replicada en el juego.

## Contexto técnico

**Lenguaje/Versión**: TypeScript 5.9; los módulos de Firebase se cargan en diferido (import dinámico) solo si hay configuración.

**Dependencias principales**: `firebase` (app/auth/firestore). Excepción a la regla III justificada en el plan de 001 (misma que mi-semana 006): sincronización en la nube pedida por Rafa; alternativa sin dependencias (nada/servidor propio) descartada allí. El peso no toca el primer arranque: carga diferida.

**Almacenamiento**: `localStorage` como fuente de verdad local (claves de las specs 003-004); copia en la nube: un documento por cuenta con la plantilla y la economía como texto.

**Testing**: verificación en vivo con navegador (modo local, pantalla de entrada, sesión cerrada) + lectura de código. El flujo con cuenta real no se automatiza: lo juega Rafa.

**Plataforma objetivo**: navegador de escritorio y móvil.

**Tipo de proyecto**: pantalla de entrada + capa de sincronización del juego web monolítico.

**Objetivos de rendimiento**: el arranque sin cuenta no carga nada de Firebase; el registro entra directo tras la promesa.

**Restricciones**: la configuración de Firebase vive en `src/firebase-config.ts` (en `.gitignore`: las claves jamás en el repo, II/VIII); sin configuración, todo es local y la pantalla lo dice.

**Escala/Alcance**: una copia por cuenta; sin multi-partida ni historial de versiones.

## Constitution Check

| Principio / lección | Estado | Nota |
|---|---|---|
| I. Spec antes que código | ✔ | Retrospectivo |
| II. Privacidad | ✔ | La partida viaja a la nube SOLO con login; las claves del servicio fuera del repo (gitignore verificado); sin datos personales en el repo |
| III. Sin dependencias | ⚠ | `firebase`: excepción aprobada por Rafa, misma que mi-semana 006; carga diferida para no pesar (justificada en el plan de 001) |
| IV. Móvil primero | ✔ | Formularios y botones táctiles |
| V. Se entiende sin explicación | ✔ | "Continuar sin cuenta (solo este navegador)" lo dice todo |
| VI. No perder datos | ✔ | Reglas de conflicto explícitas (nube gana al entrar, local sube si nube vacía); fallos de red nunca borran lo local |
| VII. Requisito comprobable | ✔ | quickstart (local automatizable; con cuenta, a mano) |
| VIII. Todo en mi carpeta | ✔ | specs/ y código en el repo local; la configuración privada existe en el disco y NO se sube |
| IX. Evidencias | ✔ | Verificación viva (login local) + código citado |
| L1 | ✔ | Clase `.hidden` (botón Salir/Instalar) |
| L2 | N/A | SW de la spec 007 (los módulos de Firebase van cacheados: nota allí) |

**Puerta: PASA** (excepción firebase documentada).

## Estructura del proyecto

### Documentación (esta función)

```text
specs/006-cuenta-sincronizacion/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── checklists/requirements.md
```

### Código fuente y puntos de contacto (sin cambios)

```text
src/auth-screen.ts            # Pantalla de entrada: entrar/registrarse/Google/local + errores
src/cloud.ts                  # Sesión y sincronización: carga diferida, entrar/salir, reglas de
                              # conflicto, subida agrupada (800 ms), silencio sin configuración
src/main.ts                   # Puerta de sesión: espera sesión restaurada o pantalla de entrada
src/team-screen.ts            # Botón "Salir" visible con sesión
src/firebase-config.example.ts # Plantilla de configuración (la real está en .gitignore)
tools/check-firebase-config.js  # Comprueba que la configuración exista y no esté vacía
```

## Seguimiento de complejidad

| Violación | Por qué es necesaria | Alternativa más simple descartada porque |
|---|---|---|
| III — `firebase` | Partida entre dispositivos pedida por Rafa (misma decisión que mi-semana 006) | Servidor propio: coste y mantenimiento; solo local: no hay partida entre dispositivos; exportar/importar archivos a mano: peaje de usuario en cada cambio de dispositivo |
