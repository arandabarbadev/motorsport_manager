# Guía de validación: Carrera en vivo (pantalla 2D)

**Fase 1** · 2026-10-10 · Con el juego en la mano (npm run dev o publicado)

## Escenarios: "hecho cuando…"

### A. Ver la carrera (FR-001, FR-002, SC-001, SC-004)

1. **Hecho cuando** entro en una carrera: el circuito se ve completo (asfalto, bordes y línea de meta) y los 20 puntos con colores de equipo; los míos con borde dorado.
2. **Hecho cuando** miro el movimiento a 1x y 10x: los coches se deslizan sin saltos (interpolación), se adelantan y doblan.
3. **Hecho cuando** un coche se retira: queda un fantasma tenue; cuando otro para: se ve pequeño y atenuado el tiempo de la parada.
4. **Hecho cuando** giro el móvil o redimensiono la ventana: el circuito se recalcula y sigue entero.

### B. Mis paradas (FR-003, SC-003)

5. **Hecho cuando** pulso una goma de un coche mío: salta el texto "Boxes al cruzar meta" y el panel dice "Entra en boxes al cruzar meta…".
6. **Hecho cuando** mi coche completa la vuelta: para, el panel cuenta la parada y su cuenta atrás, y la goma nueva aparece en la tabla.
7. **Hecho cuando** la carrera está en pausa o terminada (o el coche fuera): los botones de goma no reaccionan.

### C. Clasificación y cabecera (FR-004, FR-007, SC-002)

8. **Hecho cuando** miro la tabla durante la carrera: se reordena al adelantar; cada fila tiene hueco (+X,Xs / +XL / líder / DNF), letra de goma y barra de desgaste que pasa a aviso y peligro.
9. **Hecho cuando** miro la cabecera: GP, Vuelta X/58, clima (y "riesgo de lluvia" si aplica) y reloj creciendo.
10. **Hecho cuando** hay bandera: el aviso sobre la pista dice cuál y cuánto queda; al terminar, "¡BANDERA A CUADROS!".

### D. Control del tiempo y final (FR-005, FR-006, FR-008, FR-009)

11. **Hecho cuando** alterno Pausa y velocidades: todo se congela/reanuda sin perder nada; la activa queda marcada; cada carrera arranca a 1x.
12. **Hecho cuando** pulso "Nueva carrera" antes de terminar: se reconstruye igual, sin cobrar nada.
13. **Hecho cuando** la carrera termina: controles deshabilitados y panel de resultados con mis dos coches, premios, balance (patrocinador, sueldos, alquiler) y presupuesto; botones a "Mi Equipo" (y a temporada si era la última).
14. **Hecho cuando** adelanto o paro con mis coches: destello en el coche y texto flotante; con rivales, solo destello.

## Resultado esperado

Los 14 puntos en verde en escritorio y móvil. Fallos → /speckit-converge.
