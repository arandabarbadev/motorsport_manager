# Investigación y decisiones: Mi Equipo y la parrilla de rivales

**Fase 0** · 2026-10-10

## D1. Mi equipo editable, rivales generados

- **Decisión**: el equipo del jugador nace con nombres placeholder ("Mi Equipo", "Piloto 1/2") editables; los 9 rivales se generan con nombres únicos y stats aleatorios en rangos.
- **Por qué**: escribir 20 pilotos a mano es un peaje; generar rivales da variedad gratis, y lo editable es solo lo que al jugador le importa (su identidad).
- **Alternativas descartadas**: todo generado (el equipo no es "mío"); todo editable (peaje inicial).

## D2. Salir por debajo y crecer con dinero

- **Decisión**: mis coches arrancan en 65 (rivales 60-85, media ~72) y suben por niveles de desarrollo con tope 95 (fiabilidad 99).
- **Por qué**: si salgo igual que los mejores, la gestión económica no tiene sentido; el hueco inicial (~7 puntos) se cierra en una temporada razonable de inversiones.
- **Alternativas descartadas**: salir igual (sin progresión); salir último (frustrante, 55 sería demasiado hoyo).

## D3. Nueve categorías en lugar de cuatro stats

- **Decisión**: el desarrollo se compra en 9 categorías con nombre de escudería (aero, alerones, motor, electrónica, chasis, suspensión, neumáticos, seguridad, volante) que se pliegan sobre los 4 stats efectivos (dos sobre aero, dos sobre motor, tres sobre chasis, dos sobre fiabilidad).
- **Por qué**: pedido de Rafa (2026-09-27): más grano fino de gestión; el motor de carrera no cambia (sigue viendo 4 stats).
- **Alternativas descartadas**: comprar stats directamente (menos "juego de escudería").

## D4. Guardado directo, sin lotes

- **Decisión**: cada edición/guarda escribe la plantilla entera en localStorage al momento.
- **Por qué**: la plantilla es pequeña y las ediciones son eventos aislados; un debounce añadiría riesgo de perder la última edición al cerrar.
- **Alternativas descartadas**: guardar al salir (se pierde si el móvil mata la pestaña).

## D5. Guardado corrupto = parrilla nueva, economía intacta

- **Decisión**: la carga valida forma (versión, 10 equipos, 2 pilotos y 2 coches por equipo, existencia del equipo jugador) y ante cualquier fallo regenera la plantilla; la economía (spec 004) vive en otra clave y no se toca. Los guardados viejos migran (desarrollos ausentes → nivel 0).
- **Por qué**: una clave corrupta no debe arruinar la partida entera (VI); y las mejoras del formato no pueden borrar partidas.
- **Alternativas descartadas**: pantalla de error (innecesaria: regenerar es seguro); guardar todo en una clave (un fallo tira todo).

## D6. El orden de salida repite la fórmula del ritmo

- **Decisión**: la parrilla se ordena por ritmo esperado = 60 % piloto + 40 % coche, exactamente los pesos del motor de carrera.
- **Por qué**: la salida debe predecir la carrera (los rápidos delante) sin duplicar lógica distinta; la separación inicial escalonada evita coches apilados en la meta.
- **Alternativas descartadas**: clasificación previa jugable (alcance mayor, sin valor ahora); salida aleatoria (castiga sin motivo).
