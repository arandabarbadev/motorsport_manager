# Plan de implementación: Instalación, uso sin conexión y tema

**Rama**: `007-pwa-offline-tema` | **Fecha**: 2026-10-10 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de la función en `specs/007-pwa-offline-tema/spec.md`

## Resumen

Plan retrospectivo **sin cambios de código**: manifiesto + iconos + service worker (v3: red primero, L2) + botón de instalación + tema persistente + transiciones ya existen y funcionan en producción. El offline se verificó en vivo con la red cortada; la instalación, con el móvil de Rafa. Nota: la carcasa PWA nació aquí antes que en mi-semana (la lección L2 de la constitución salió de este juego, fondo v2).

## Contexto técnico

**Lenguaje/Versión**: service worker y manifiesto escritos a mano (JS/JSON); tema y transiciones en TypeScript.

**Dependencias principales**: ninguna nueva. Pila del proyecto: excepción documentada en el plan de 001.

**Almacenamiento**: caché del navegador para la carcasa (HTML/assets con huella); la partida, en `localStorage` (nunca en caché); el tema, una marca por navegador.

**Testing**: verificación en vivo: fondo registrado + **offline real** (red cortada desde el navegador automatizado) + compilación de producción. Instalación: móvil de Rafa (anotada).

**Plataforma objetivo**: Chrome/Safari/Edge móvil y escritorio; GitHub Pages (build con ruta relativa).

**Tipo de proyecto**: carcasa PWA del juego web monolítico (Vite).

**Objetivos de rendimiento**: apertura offline inmediata; assets con huella cache-first (segunda visita instantánea).

**Restricciones**: red primero para la página (L2); sin dependencias nuevas (III); registro del fondo solo en producción.

**Escala/Alcance**: una carcasa; una versión de caché vigente (`f1manager-v3`).

## Constitution Check

| Principio / lección | Estado | Nota |
|---|---|---|
| I. Spec antes que código | ✔ | Retrospectivo |
| II. Privacidad | ✔ | La caché guarda el juego, nunca la partida |
| III. Sin dependencias | ✔ | SW y manifiesto a mano; los módulos de Firebase ya son excepción de la spec 006 |
| IV. Móvil primero | ✔ | Es la razón de ser de la función (instalable, offline, tema) |
| V. Se entiende sin explicación | ✔ | Instalación sigue el flujo del sistema; botón con texto |
| VI. No perder datos | ✔ | La partida jamás vive en la caché |
| VII. Requisito comprobable | ✔ | quickstart (offline verificado en vivo; instalación con el móvil) |
| VIII. Todo en mi carpeta | ✔ | specs/ en el repo local |
| IX. Evidencias | ✔ | Offline verificado en vivo con red cortada (2026-10-10) |
| L1 | ✔ | La carcasa usa clase `.hidden` con display:none (ui.css:66) |
| **L2. HTML a la red primero** | ✔ | **Es el corazón de esta función**: el fondo responde con red revalidada y cae a caché solo sin conexión — solución nacida aquí (v2) y subida a la constitución |

**Puerta: PASA.**

## Estructura del proyecto

### Documentación (esta función)

```text
specs/007-pwa-offline-tema/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── checklists/requirements.md
```

### Código fuente y puntos de contacto (sin cambios)

```text
public/manifest.webmanifest  # nombre, iconos (192/512 + 512 adaptable), standalone, color, es
public/sw.js                 # fondo v3: navegaciones red-primero (revalidadas) con caída a caché;
                             # assets con huella cache-first; al activar, borra cachés viejas
public/icon-*.png|svg        # iconos del manifiesto (generados con tools/make-icons.js)
index.html                   # <link rel="manifest">, theme-color, apple-touch-icon, lang es
src/main.ts                  # registro del fondo solo en la build de producción por http/https
src/theme.ts                 # tema persistido ("f1manager:theme"), oscuro por defecto, oyentes
src/team-screen.ts           # botón "Instalar app" (diálogo del navegador cuando lo ofrece)
src/screen-transition.ts     # fundido único para todos los cambios de pantalla
src/race-screen.ts           # la capa del circuito repinta al cambiar el tema
```

## Seguimiento de complejidad

> Sin entradas: no hay violaciones que justificar (la pila del proyecto está justificada en el plan de 001).
