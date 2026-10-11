# Guía de validación: Instalación, uso sin conexión y tema

**Fase 1** · 2026-10-10 · Con el juego en la mano; ⭐ = con el móvil de Rafa

## Escenarios: "hecho cuando…"

### A. Instalación ⭐ (FR-001, SC-001)

1. **Hecho cuando** añado la web a la pantalla de inicio: icono del juego y nombre "F1 Manager".
2. **Hecho cuando** la abro desde el icono: pantalla completa, sin barra de navegador, con el color del juego en la barra del sistema.
3. **Hecho cuando** un navegador que ofrece instalación abre Mi Equipo: botón "Instalar app" visible; al pulsarlo, el diálogo del sistema.

### B. Sin conexión (FR-002, FR-008, SC-002) — verificado en vivo el 2026-10-10

4. **Hecho cuando** visito el juego una vez con conexión: el fondo queda instalado (DevTools → Application → Service workers).
5. **Hecho cuando** corto la red (DevTools → Network → Offline) y recargo: el juego abre (pantalla de entrada) y se puede jugar una carrera con la partida del navegador.
6. **Hecho cuando** vuelvo a tener red: todo vuelve a la normalidad sin pasos manuales.

### C. Última versión (FR-003, FR-004, FR-005, SC-003)

7. **Hecho cuando** se publica una versión nueva y abro el juego: me llega la nueva (la página se pide a la red primero, revalidada).
8. **Hecho cuando** miro las cachés en DevTools: solo queda la de la versión vigente (las viejas se borran al activar el fondo).
9. **Hecho cuando** desarrollo en local (`npm run dev`): no hay fondo registrado (solo producción).

### D. Tema y transiciones (FR-006, FR-007, SC-004)

10. **Hecho cuando** pulso el botón de tema en cualquier pantalla: toda la interfaz cambia; en la carrera, el circuito repinta sus colores al instante.
11. **Hecho cuando** recargo tras cambiar el tema: se recuerda (oscuro la primera vez).
12. **Hecho cuando** navego entre pantallas (entrada → equipo → carrera → temporada): mismo fundido breve en todos los cambios.

## Resultado esperado

Puntos 4-6 y 9 verificados en vivo (navegador automatizado con red cortada; evidencia del 2026-10-10); 1-3 y 7-8 con el móvil/la publicación real (⭐); 10-12 jugados en cada partida. Fallos → /speckit-converge.
