# Research 015 — Diagnóstico

## Dorsal fuera del círculo

`drawCars` (race-screen.ts) pinta el dorsal así (estado actual):

```ts
ctx.font = `bold ${Math.max(11, Math.round(r * 1.5))}px ...`;
const ny = p.y - r * 2.1;   // flotando 2,1 radios POR ENCIMA
```

Con el radio de 014 (`max(4, 0,013·min)`) en un móvil (track-wrap ≈ 38vh ≈ 290 px de lado menor) el círculo queda en 4 px de radio: meter ahí un número es ilegible. Por eso el plan sube el **mínimo** a 7 px (escritorio no cambia: 0,013·940 ≈ 12 px) y escala la fuente con el radio efectivo `rr` (en boxes el círculo se encoge a 0,75·r y el dorsal debe encogerse con él).

## Bug del `return` en drawCars (FR-004)

```ts
if (car.status === 'dnf') {
  ...ghost...
  return;   // ← sale de drawCars ENTERA
}
```

El bucle recorre los coches ordenados por posición DESCENDENTE (peores primero). Un DNF congela su progreso, se hunde al fondo y acaba siendo el PRIMERO del bucle: desde ese frame `drawCars` solo dibuja el fantasma y **ningún otro coche**. Encaja con el síntoma de Rafa de averías "silenciosas" (017 pondrá además el aviso). Corrección: `continue`.

## Goma en la tabla

`updateHud` rellena `row.tyre` y `row.wearFill` para las 20 filas. La rejilla de `.standing-row` (8 columnas en escritorio) alinea las filas entre sí: si las filas de rivales pierden celdas (`display:none` o sin spans), la columna BOX se desplaza. Solución: las celdas existen siempre, las de rivales quedan vacías y la barra se oculta con `visibility:hidden` (conserva el hueco).

## Goma en "Mis boxes"

`PitBox` ya guarda `status` y `buttons` y `updateHud` lo refresca cada 200 ms: añadir `tyreEl`/`wearFill`/`pct` al interfaz y una línea `.pit-tyre` bajo el título reutiliza las clases `.tyre.compound` y `.wear/.wear-fill` ya existentes (colores por compuesto y umbral warn/danger gratis).

## Técnica de verificación (sin variable de canvas)

- **Dorsal dentro**: en la parrilla (formación, sin textos flotantes) se clasifican los píxeles por color de equipo (de `.standing-row .tcolor`, como mm-v014), se agrupan en clusters conectados y por cada cluster se mide (a) "tinta" dentro del disco de 0,6·r del centro (píxeles que no son color de equipo ni asfalto: relleno blanco ≥215 o mezcla oscura del contorno) y (b) píxeles blancos en la banda por encima (1,3–2,6·r): la vieja posición del dorsal debe quedar vacía. Umbrales ≥80 % de clusters.
- **Rivales sin goma / boxes con goma**: aserciones DOM directas (textContent vacío, width de `.wear-fill`, `.pit-tyre-pct` numérico y coherente con la tabla).
- **Bugfix**: imposible forzar un DNF puntual sin tocar el motor; se verifica en el guion de 017 (fiabilidad baja sembrada), aquí queda cubierto por harness + revisión.

Lección heredada de 014: las evidencias de canvas son por píxeles, no por visión (el visor de imágenes alucina).
