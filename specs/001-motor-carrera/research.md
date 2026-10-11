# Investigación y decisiones: Motor de simulación de carrera

**Fase 0** · 2026-10-10

## D1. Tiempo de carrera: segundos simulados, no vueltas

- **Decisión**: un tick avanza `simTimeMultiplier` segundos simulados; cada segundo, un coche recorre `ritmo / 90` de vuelta (vuelta de referencia de 90 s).
- **Por qué**: permite acelerar la carrera (1x-20x) sin tocar la física, y hace que desgaste, incidentes y clima sean tasas por segundo fáciles de calibrar.
- **Alternativas descartadas**: avanzar vueltas enteras (saltos imposibles de animar); tiempo real (una carrera duraría horas).

## D2. Validar el motor antes de pintar nada

- **Decisión**: Fase 1 del desarrollo sin UI: parrilla determinista (semilla fija) y carrera completa por consola con correlación de Spearman ritmo↔posición y registro de paradas por vuelta.
- **Por qué**: si la simulación no es creíble, la pantalla solo enseña el error más bonito; el banco de pruebas permite reajustar constantes sin abrir el navegador.
- **Alternativas descartadas**: probar solo con la UI — cada iteración sería lenta y subjetiva.

## D3. Las paradas ocurren al cruzar meta

- **Decisión**: la orden se encola; al completar vuelta en la línea de meta, el coche entra en boxes y queda detenido el tiempo del callejón (o el mejorado por mecánicos).
- **Por qué**: como en la F1 real; evita coches congelados en mitad del trazado y hace que la orden sea una decisión anticipada.
- **Alternativas descartadas**: parar en el instante del clic (congelamientos aleatorios sobre la pista).

## D4. IA de boxes por utilidad ponderada, no umbrales sueltos

- **Decisión**: `computePitScore` pondera desgaste (+), amenaza de undercut (+), coste de la parada (−), agresividad (+), valor de la posición (−) y tolerancia al riesgo (−); se para por encima de 55, con red de seguridad al 90 % de desgaste y vetos (<25 % de desgaste, <3 vueltas para el final, gomas equivocadas fuerzan parada).
- **Por qué**: produce paradas repartidas y reactivas al contexto, no una manada en la misma vuelta.
- **Alternativas descartadas**: "parar siempre a mitad de carrera" (predecible y aburrido); puro azar (incomprensible).

## D5. Incidentes como probabilidades por segundo

- **Decisión**: toque leve 1/30.000 s⁻¹ (amarilla 25 s, ritmo al 55 %), accidente 1/60.000 s⁻¹ (DNF + amarilla o roja al 25 % de los casos, 70 s), avería 1/110.000 s⁻¹ escalada por fiabilidad (DNF sin bandera); todo multiplicado por agresividad/riesgo del piloto y el clima (hasta ×2,6 con lluvia fuerte).
- **Por qué**: con 20 coches y ~4.500 s da lo buscado: ~3 amarillas, 1-2 accidentes y ~1 avería por carrera, sin ser fijos.
- **Alternativas descartadas**: incidentes guionizados (carreras iguales); sin incidentes (spec 004 sin riesgo).

## D6. Lluvia por pasos y por carrera

- **Decisión**: el clima cambia un paso (seco ↔ ligera ↔ fuerte) a ~1/1.500 s⁻¹, y solo en carreras construidas con riesgo de lluvia.
- **Por qué**: el jugador pidió lluvia en algunas carreras, no en todas; los pasos evitan saltos absurdos y dan ventana para la estrategia de gomas.
- **Alternativas descartadas**: lluvia en todas las carreras (monótono); clima global de temporada (menos variedad dentro del fin de semana).

## D7. Números de equilibrio = valores iniciales aprobados, no verdades

- **Decisión**: todas las constantes (pesos del ritmo 60/40, desgastes, tasas de incidentes) viven arriba del módulo con comentarios y la nota "re-tune by playtesting".
- **Por qué**: el equilibrio se ajusta jugando; tenerlos agrupados y documentados hace el reajuste barato.
- **Alternativas descartadas**: calibración "definitiva" a ciegas.
