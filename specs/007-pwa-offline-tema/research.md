# Investigación y decisiones: Instalación, uso sin conexión y tema

**Fase 0** · 2026-10-10

## D1. La lección L2 nació aquí

- **Decisión**: el fondo pide la página a la red primero (revalidada, `no-cache`) y solo cae a la copia cacheada sin conexión; los assets con huella en el nombre van cache-first.
- **Por qué**: la v1 cacheaba la página: los arreglos publicados no llegaban hasta borrar la caché a mano. La v2 introdujo red-primero (commit "la pagina se pide a internet primero para no quedarse en versiones viejas") y la regla subió a la constitución como L2; mi-semana la heredó después. La v3 añadió revalidación explícita y limpieza total al activar.
- **Alternativas descartadas**: cache-first para todo (lo que causó el problema); stale-while-revalidate (la página mostraría la vieja una vez más).

## D2. Versiones de caché con limpieza al activar

- **Decisión**: la caché lleva versión (`f1manager-v3`); al activarse el fondo nuevo, borra toda caché que no sea la suya y toma el control sin esperar.
- **Por qué**: un cambio que rompe compat se resuelve subiendo la versión: el jugador no limpia nada jamás; `skipWaiting` + limpieza garantizan que la nueva versión manda pronto.
- **Alternativas descartadas**: dejar que el navegador jubile fondos viejos (lento y con solapamientos raros).

## D3. Registro solo en producción

- **Decisión**: el fondo se registra únicamente en la build de producción servida por http/https.
- **Por qué**: en desarrollo la página cambia a cada guarda: cachearla envenena las pruebas; y el registro en `file://` simplemente no funciona.
- **Alternativas descartadas**: registrar siempre con bypass en dev (complejidad sin beneficio).

## D4. Botón de instalación dentro del juego

- **Decisión**: capturar el aviso del navegador y mostrar "Instalar app" en la cabecera de Mi Equipo; donde el navegador no lo ofrece (iOS), el botón no aparece y la instalación manual del sistema vale igual.
- **Por qué**: pedir la instalación en el momento de mayor engagement (ya jugando) y con el diálogo nativo, sin Máscaras custom que prometen de más.
- **Alternativas descartadas**: banner propio de "instálame" (ruido y promesas que el sistema igual decide); solo dejar la instalación al descubrimiento del usuario.

## D5. Tema por dispositivo, no por cuenta

- **Decisión**: el tema es una marca del navegador (`f1manager:theme`), oscuro por defecto, con botón en todas las pantallas; no viaja con la cuenta.
- **Por qué**: el móvil quiere oscuro de noche y claro de día: es del contexto, no de la partida; sincronizarlo entre dispositivos sería imponer el del último.
- **Alternativas descartadas**: tema en la nube (peor experiencia para el caso real); seguir al sistema (menos control, y el juego ya nacía oscuro).

## D6. El circuito repinta, no se reconstruye

- **Decisión**: la carrera pinta el trazado en una capa aparte con los colores del tema activo; al cambiar de tema, solo esa capa se regenera al vuelo.
- **Por qué**: cambiar de tema a mitad de carrera no puede tocar el estado de la carrera (regla 2 del motor): repintar la capa es barato y seguro.
- **Alternativas descartadas**: colores fijos de pista (feo en claro); reconstruir la carrera (¡destruiría el estado!).

## D7. Una transición para todo

- **Decisión**: un único envoltorio de cambio de pantalla (fundido out ~150 ms + entrada con animación) usado por entrada, equipo, carrera y temporada.
- **Por qué**: una sola sensación de navegación; y un solo sitio donde arreglar si algo ronca.
- **Alternativas descartadas**: transiciones por pareja de pantallas (inconsistente y más código); ninguna (saltos feos en un juego que se siente vivo).
