# Guía de validación: Economía, patrocinio y sede

**Fase 1** · 2026-10-10 · Con el juego en la mano; conviene papel y lápiz

## Escenarios: "hecho cuando…"

### A. Cobro por correr (FR-001, FR-002, FR-007, SC-001, SC-002)

1. **Hecho cuando** termina una carrera: el panel lista mis dos coches con su puesto y su premio, y el total premios es la suma.
2. **Hecho cuando** leo el desglose: patrocinio (+), sueldos de pilotos (−), sueldos del personal (−), alquiler (−) y balance; el presupuesto mostrado = anterior + balance (cuenta a mano).
3. **Hecho cuando** repito una carrera ya registrada (p. ej. recargando la app y volviendo a correr): no cobra ni registra doble, y el botón de carrera sigue al GP siguiente.

### B. Patrocinadores (FR-003, FR-004, SC-003)

4. **Hecho cuando** abro "Patrocinadores" recién empezada la temporada: solo firmables los peores; los demás muestran el puesto que exigen ("P5").
5. **Hecho cuando** firmo 5: el sexto dice "Completo"; quito uno y puedo firmar otro.
6. **Hecho cuando** mejoro mi mejor resultado de la temporada: los patrocinadores que exigen ese puesto o menos aparecen con "Firmar".
7. **Hecho cuando** tengo comerciales contratados: el resumen de la pestaña cobra más que la suma simple de los pagos (bonus aplicado).

### C. Sede (FR-005)

8. **Hecho cuando** abro "Sede": tres tipos con nivel, efecto actual y coste del siguiente (crece con el nivel); "MÁX" al nivel 5.
9. **Hecho cuando** subo mecánicos: en la siguiente carrera mis paradas duran menos (se ve el contador del box y la parrilla de la spec 002).
10. **Hecho cuando** subo ingenieros: los botones de desarrollo del coche muestran el precio rebajado.

### D. Reinicio (FR-006, SC-004)

11. **Hecho cuando** pulso "Reiniciar": confirmación que enumera qué se pierde; al aceptar, presupuesto 350 M, personal nivel 1, sin patrocinadores, desarrollos a 0, temporada 1… y mi nombre y mis pilotos intactos.

## Resultado esperado

Los 11 puntos en verde, con las cuentas del punto 2 cuadrando en papel. Fallos → /speckit-converge.
