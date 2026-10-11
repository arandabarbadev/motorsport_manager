# Investigación y decisiones: Cuenta y sincronización

**Fase 0** · 2026-10-10

## D1. Mismo diseño que mi-semana

- **Decisión**: replicar la función de cuenta de mi-semana (spec 006 allí): Firebase, sesión, un documento por cuenta con la partida como texto, nube gana al entrar.
- **Por qué**: Rafa ya validó ese diseño en otra app suya; reusarlo mantiene una sola mentalidad de guardado entre sus juegos.
- **Alternativas descartadas**: diseñar de cero (reresolver lo resuelto); exportar/importar manual (peaje).

## D2. Firebase en diferido

- **Decisión**: los módulos de Firebase se importan dinámicamente SOLO si hay configuración y hace falta; el modo local no los carga jamás.
- **Por qué**: el SDK pesa más que el propio juego; castigar el primer arranque (o el offline) por una cuenta que quizá no se usa sería un error.
- **Alternativas descartadas**: import estático (bundle inicial enorme para todos).

## D3. La nube gana al entrar, con una sola recarga

- **Decisión**: al iniciar sesión se baja la copia de la nube; si difiere de la local, se aplica y se recarga una vez; si es igual, nada; si la nube está vacía, se sube la local.
- **Por qué**: es la regla más fácil de explicar ("la nube manda al entrar") y evita el bucle de recargas (comparación por texto exacto antes de tocar nada).
- **Alternativas descartadas**: fusionar partida a partida (merge) — imposible de acertar con economía+temporada; la local manda — pisaría el progreso del otro dispositivo.

## D4. Subida agrupada, no en cada tecla

- **Decisión**: cada guardado programa una subida con 800 ms de alto; llega otro guardado, se reprograma.
- **Por qué**: editar un nombre dispara muchos guardados; agrupar evita una ráfaga de escrituras en la nube por cada letra.
- **Alternativas descartadas**: subir en cada guardado (coste y quota); subir solo al cerrar (el móvil mata pestañas: se pierde lo último).

## D5. Los fallos de red nunca rompen la partida

- **Decisión**: toda operación de nube va con red de seguridad: al fallar, se sigue jugando en local y el siguiente cambio reintenta.
- **Por qué**: el juego tiene que funcionar offline (spec 007); la nube es un acompañante, no un requisito.
- **Alternativas descartadas**: bloquear guardados sin red (jugable solo con conexión); cola persistente de cambios (complejidad sin valor aquí: la partida entera viaja, no parches).

## D6. Una copia por cuenta, la partida entera

- **Decisión**: un único documento por cuenta con las dos claves (plantilla y economía) como texto.
- **Por qué**: la partida es pequeña (<200 KB) y siempre coherente si viaja entera; sin historial ni multi-slot, que nobody pidió.
- **Alternativas descartadas**: colecciones por entidad (más escrituras, más puntos de fallo); multi-partida (alcance).

## D7. Configuración fuera del repo

- **Decisión**: la configuración de Firebase vive en un archivo ignorado por git, con plantilla de ejemplo incluida y herramienta que comprueba que exista.
- **Por qué**: claves en un repo público, jamás (II/VIII); la plantilla y la herramienta evitan el "no me funciona el login" de siempre.
- **Alternativas descartadas**: variables de entorno en el build (complica el despliegue a Pages para cero beneficio aquí).
