# Modelo de datos: Instalación, uso sin conexión y tema

**Fase 1** · 2026-10-10

## Entidad: Caché de la carcasa (gestionada por el fondo de la app)

| Dato | Notas |
|---|---|
| versión de caché (`f1manager-v3`) | Subir la versión invalida todo al activar |
| página del juego | Copia de la última navegación con éxito (respaldo offline) |
| assets con huella | Inmutables: cache-first, se guardan al pedirarse la primera vez |

Nunca contiene la partida: `localStorage` y (con cuenta) la nube son las únicas casas de los datos (spec 006).

## Entidad: Preferencia de tema (por navegador)

| Campo | Tipo | Notas |
|---|---|---|
| tema | claro / oscuro | Oscuro por defecto; vive en `localStorage["f1manager:theme"]` |
| oyentes | lista en memoria | La carrera repinta el circuito cuando cambia |

No viaja con la cuenta: es del dispositivo.

## Entidad: Evento de instalación (efímero)

El aviso del navegador de que la app es instalable queda capturado en memoria hasta que el jugador pulsa "Instalar app" (o se descarta). Nada persiste.

## Relación con las demás funciones

- Specs 001-006: la carcasa las envuelve; nada de su contenido cambia.
- 006: los módulos de la nube, cacheados al usarse una vez: el offline no depende de ellos.
