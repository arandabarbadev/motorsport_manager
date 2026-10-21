# Research 018

## 1. Por qué Jerez salía roto (y cómo se arregla de verdad)

- `tools/convert-layouts.js` lee `data/f1-circuits/*.geojson`. El de Jerez se generó desde
  el **way 831985059 = perímetro del recinto** (`leisure=sports_centre`, 64 nodos),
  confirmado con Nominatim y con la API de OSM (`way/831985059/full.json`). No es la pista.
- La pista REAL está mapeada en OSM como 24 ways `highway=raceway`+`sport=motor` con
  nombres de curva reales (Curva Dry Sac, Curva Sito Pons, Chicane Senna, Curva Ferrari,
  Curva Lorenzo, Pit Lane…). Descargado el mapa de la zona con
  `api.openstreetmap.org/api/0.6/map.json?bbox=-6.070,36.680,-6.000,36.740`
  (Overpass público bloqueado desde esta red: overpass-api.de y kumi devuelven 000;
  la API REST de OSM sí funciona).
- Ensamblado (guion `%TEMP%/mm-jerez.js`, conservado como `tools/assemble-jerez.js`):
  grafo no dirigido con aristas nodo-a-nodo de cada way → poda iterativa de colas
  (grado 1) → recorrido del lazo eligiendo en cada cruce la continuación MÁS ALINEADA
  con la dirección de llegada (evita ramas de boxes). Resultado: **lazo cerrado de 178
  nodos y 4,426 km** (real: 4,428 km — 2 m). Se guarda como geojson LineString con el
  mismo formato que espera el tool, y `convert-layouts.js` sigue funcionando tal cual.

## 2. La métrica de "se juntan" (por qué Singapur funde)

Distancia mínima en unidades normalizadas (0..1 del espacio de la pista; la carretera
pintaba 0,075 de ancho, con borde 0,093) entre puntos del path final con separación de
arco > 15 % (tramos que NO son la misma curva):

| circuito | mín | circuito | mín |
|---|---|---|---|
| Suzuka (puente) | 0,007 | Estoril | 0,048 |
| Bakú | 0,007 | Interlagos | 0,048 |
| Yeda | 0,010 | Montreal | 0,061 |
| **Singapur** | **0,019** | Le Mans | 0,062 |
| Mónaco | 0,025 | Austin | 0,067 |
| Madrid | 0,028 | México | 0,083 |
| Kyalami | 0,031 | Spa | 0,086 |
| Yas Marina | 0,031 | Hungría | 0,092 |
| Zandvoort | 0,032 | Imola | 0,098 |
| Nürburgring | 0,041 | Monza | 0,109 |
| Silverstone | 0,044 | Las Vegas | 0,137 |
| | | Melbourne | 0,174 |
| | | Jerez (roto) | 0,257 |

Conclusión: no es solo Singapur — casi todos los urbanos funden en algún tramo. La cura
tiene que ser genérica, no parchear un circuito.

## 3. Elección de anchos (blanca + fina + descolisión)

- Carretera: 0,075 → **0,06** del lado corto. Coches 0,013 de radio ⇒ siguen cabiendo
  ~2,2 coches de ancho (F1 real ~2,5): legible y con sitio para el roaming lateral
  (±42 % del ancho, proporción intacta del spec 012/014).
- Línea blanca: grosor `max(2, road*0,09)` a cada lado, PINTADA como trazo blanco bajo el
  asfalto (trazo 1: halo oscuro `road + 2·edge + halo`, trazo 2: blanco `road + 2·edge`,
  trazo 3: asfalto `road`). El halo garantiza contraste también en tema claro (fondo
  #eef1f4: el blanco solo no se vería).
- Descolisión con **objetivo por arco** (hallazgo clave del prototipo): los pares a 6-10 %
  de vuelta son PLEGAMIENTOS del mismo complejo (esses de Suzuka, serpiente de Yeda,
  estadio de Austin) y solo piden abrirse a 0,058; los pares a >10 % son paralelos de
  verdad y piden 0,078. Además el empuje va COTADO (se normaliza por `max(d, 0,25·T)`):
  sin el tope, en un cruce real (d→0, el puente de Suzuka) la fuerza `(T-d)/d` explota y
  tritura el trazado — así se rompían las primeras pruebas. Paso 0,28/iteración, ventana
  de suavizado ±3 muestras, 300 iteraciones. Resultado: Singapur 0,019→0,082, Bakú
  0,007→0,074, Mónaco 0,024→~0,077 (paralelos), Madrid 0,028→0,078, Suzuka paralelos
  0,007→0,076 (el puente queda ~0,005: es un cruce, se cruza), Yeda pliegue 0,025 /
  paralelo 0,051 (la serpiente de muros abre lo que la forma real permite).

## 4. Goma intermedia: tablas de ritmo y desgaste

Modelo actual: `weatherPenalty = base(tiempo) × wetFactor`, igual para todas las gomas.
Nuevo: eje compuesto×tiempo. `base` sigue siendo {dry 0, lightRain 0,05, heavyRain 0,15}
× `wetFactor` (skill), pero se escala por el ACIERTO de la goma y se suma una penalización
extra si no es la goma del tiempo:

| compound | dry | lightRain | heavyRain |
|---|---|---|---|
| S/M/H | 0 | base×1 + 0,03 | base×1 + 0,10 |
| inter | +0,05 (sobrecalienta) | base×0,15 | base×0,55 + 0,03 |
| wet | +0,08 | base×0,50 + 0,01 | base×0,15 |

Con wetSkill 50 (lightRain): slick 0,075 · **inter 0,007** · wet 0,033. En heavyRain:
slick 0,235 · inter 0,104 · **wet 0,020**. La inter gana en ligera, la wet en fuerte,
ambas penalizan en seco: exactamente el hueco pedido. En dry, S/M/H idéntico a hoy (0).

Desgaste (factor sobre el compuesto en seco; el compuesto sigue siendo S 1,4 / M 1,0 /
H 0,7 / I 1,1 / W 1,1):

| compound | dry | lightRain | heavyRain |
|---|---|---|---|
| S/M/H | ×1 | ×1,15 | ×1,3 |
| inter | ×1,5 | ×0,85 | ×1,0 |
| wet | ×1,9 | ×0,95 | ×0,75 |

IA (runPitStopAI): "adecuado" pasa de `!= wet` a conjuntos: dry={S,M,H},
lightRain={I,W}, heavyRain={I,W}; goma preferida al parar: lightRain→`inter`,
heavyRain→`wet`, dry→`chooseCompound`. El jugador lo ve en el aviso del tiempo.

## 5. Restricciones encontradas

- Overpass público bloqueado (000 con curl); API REST de OSM y Nominatim OK. El
  ensamblador se queda en `tools/` documentado, por si hay que repetirlo con otro circuito.
- `loadCareer` reconstruye el calendario en cada carga ⇒ quitar circuitos es gratis para
  saves, pero los `seasonResults` de rondas retiradas hay que FILTRARLOS (si no, cuentan
  en `isSeasonComplete` y aparecen en la pantalla de temporada sin circuito).
- El visor de imágenes de turno alucina: las verificaciones van por píxeles/DOM (lección
  permanente del proyecto).
