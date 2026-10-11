# Modelo de datos: Cuenta y sincronización

**Fase 1** · 2026-10-10

## Entidad: Sesión (fuera de la partida)

| Campo | Tipo | Notas |
|---|---|---|
| identificador de usuario (`uid`) | texto | Clave de la copia en la nube; nulo = sin sesión (modo local) |

No se persiste en el navegador: la da el proveedor de sesión al arrancar (restauración automática).

## Entidad: Partida en la nube — un documento por cuenta

```text
f1manager/{uid} = { partida_economia: texto, partida_plantilla: texto }
```

- Cada campo es el MISMO texto que vive en `localStorage` (claves de las specs 003-004): comparar textos decide si hay conflicto, sin parsear nada.
- Se escribe entera (las dos claves juntas): nunca hay media partida en la nube.
- La comparación texto contra texto en el arranque evita la recarga cuando no hay cambios (FR-004).

## Entidad: Estado de sincronización (en memoria, no persistido)

| Dato | Para qué |
|---|---|
| sesión iniciada (bool) | Activar/desactivar subidas y el botón Salir |
| temporizador de subida (800 ms) | Agrupar ráfagas de guardados en una escritura |
| servicios cargados (bool) | Carga diferida de los módulos de nube |

## Flujos que cruzan entidades

- **Al entrar con cuenta**: bajar copia → comparar textos con las claves locales → (distinta: aplicar + una recarga | igual: nada | vacía: subir local).
- **Al guardar partida (con sesión)**: escribir local al momento + programar subida agrupada.
- **Sin sesión**: solo `localStorage`, para siempre jugable.

## Relación con las demás funciones

- Plantilla (003) y economía (004): son el contenido que viaja, siempre las dos juntas.
- PWA (007): el servicio de nube funciona offline solo con lo cacheado; la partida local nunca depende de la red.
- Tema (007): decisión de dispositivo, no viaja con la cuenta.
