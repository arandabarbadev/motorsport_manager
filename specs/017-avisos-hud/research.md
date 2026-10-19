# Research 017 — Dónde enganchar el aviso y cómo verificarlo sin tocar el motor

## El evento ya existe

`simulation.runIncidents` emite `{ type:'incident', carDriverId, incidentKind:'mechanical' }` justo cuando hace `car.status='dnf'` (fallo mecánico, sin bandera). `race-screen.consumeRaceEvents` ya consume esa rama (texto flotante gris "¡Avería! P#" + feed). El aviso nuevo se añade EN ESA RAMA: el nombre sale de `driverById(ev.carDriverId)` y la posición del propio coche (`car.position` en el momento del evento, la misma que ya muestra el feed).

La probabilidad base es `MECH_FAILURE_PER_SEC × (2 − reliability/100)` por coche y segundo simulado: reliability 100 → factor 1,0; reliability 0 → factor 2,0 (tope del juego). NO se toca.

## Por qué DOM y no canvas

El requisito es un componente GENÉRICO reutilizable (patrocinadores, fichajes, moral — todas pantallas de gestión SIN canvas). Un hub DOM (`notice-stack` + tarjetas) montado en cualquier contenedor posicionado cumple; en la carrera vive dentro de `.track-wrap` (position:relative) y flota sobre el lienzo sin mezclarse con el repintado por frame.

## Verificación en vivo sin inyectar nada en el motor

1. Partida nueva local → volver a Mi Equipo → mutar el roster guardado (`f1manager:roster:a`): los 20 `cars[].reliability = 0`. El race-builder usa el spec de rivales tal cual y el del jugador suma desarrollos (0) → todos con factor máximo REAL del juego.
2. Entrar a carrera, luces fuera, 20x (los incidentes solo ocurren en bandera verde; las amarillas de trompos/accidentes la pausan 25 s simulados, minoritario).
3. Tasa esperada: ~20 coches × 20 s simulados/s reales × (1/110000 × 2,0) ≈ un aviso cada ~2,3 min; sondear hasta 7 min y, si no llega, "Nueva carrera" y repetir (hasta 2 intentos).
4. Al aparecer `.notice`: texto con "Retirada por avería", un nombre de la tabla y `P\d+`; contar ≤ 4 tarjetas siempre; captura; esperar ttl+1 s y comprobar que ESA tarjeta ya no está (autodesaparición).

Lecciones aplicadas: evidencias de UI por DOM/píxeles (nada de visor de imágenes); el modo local no guarda sesión (la pantalla de acceso reaparece en cada carga — flujo de mm-probe); matar el websocket y el proceso en el catch para no dejar node colgado.
