# Guía de validación: Cuenta y sincronización

**Fase 1** · 2026-10-10 · Con el juego en la mano; ⭐ = con las cuentas reales de Rafa

## Escenarios: "hecho cuando…"

### A. Modo local (FR-001, SC-004) — verificable en cualquier navegador

1. **Hecho cuando** abro el juego y pulso "Continuar sin cuenta (solo este navegador)": entro a Mi Equipo y todo el juego responde.
2. **Hecho cuando** juego una carrera y recargo: la partida (equipo, dinero, ronda) sigue ahí.
3. **Hecho cuando** corto la red y sigo jugando: nada se queja; al volver la red, nada explota.

### B. Entrar y registrarse (FR-002, FR-003, SC-001) ⭐

4. **Hecho cuando** me registro con correo y contraseña: entro al juego con sesión.
5. **Hecho cuando** cierro el navegador y vuelvo a abrir: sesión restaurada, directo a la partida.
6. **Hecho cuando** pulso "Continuar con Google": entro en un clic.
7. **Hecho cuando** me equivoco de contraseña: el error se pinta y puedo reintentar.

### C. Reglas de la nube (FR-004, FR-006, SC-002, SC-003) ⭐

8. **Hecho cuando** entro con la cuenta desde un navegador vacío: baja mi partida de la nube (una recarga y a jugar).
9. **Hecho cuando** entro con la nube y el navegador IGUALES: no hay recarga ni parpadeo.
10. **Hecho cuando** cambio algo (compro, corro) y espero un momento: la nube tiene la copia nueva (se ve entrando desde otro dispositivo).
11. **Hecho cuando** la partida viaja: siempre entera (equipo + economía + temporada).

### D. Salir (FR-007)

12. **Hecho cuando** pulso "Salir" con sesión: vuelve a la pantalla de entrada y el botón desaparece.

## Resultado esperado

Puntos 1-3 y 12 verificados en vivo (navegador automatizado); 4-11 con las cuentas reales de Rafa (⭐). Fallos → /speckit-converge.
