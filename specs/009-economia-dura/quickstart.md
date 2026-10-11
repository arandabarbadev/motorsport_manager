# Guía de validación: Economía dura

**Fase 1** · 2026-10-11 · Con el juego en la mano

## Escenarios: "hecho cuando…"

### A. Precios crecientes (FR-001, FR-002, FR-006, SC-001, SC-004)

1. **Hecho cuando** miro una categoría de desarrollo a nivel 0: el botón dice el precio base; al comprar, el siguiente botón muestra un precio MAYOR, y así hasta "MÁX" (nivel 15).
2. **Hecho cuando** subo personal de sede: cada nivel cuesta más que el anterior hasta "MÁX" (nivel 10).
3. **Hecho cuando** subo ingenieros: los precios de desarrollo bajan proporcionalmente (descuento sobre el precio creciente).

### B. Arranque (FR-003, SC-003)

4. **Hecho cuando** creo una partida nueva (o pulso Reiniciar y acepto): presupuesto 200 M€ y el aviso del reinicio dice 200 M.
5. **Hecho cuando** entro con una partida guardada de antes del cambio: su presupuesto sigue intacto.

### C. Patrocinadores (FR-004, FR-005, SC-002)

6. **Hecho cuando** abro Patrocinadores: 150 filas; la primera paga 3 M€/carrera y exige P1; la última ~0,3 y P20.
7. **Hecho cuando** miro el resumen: cuenta "n/8 firmados".
8. **Hecho cuando** firmo 8: el noveno dice "Completo".
9. **Hecho cuando** entro con patrocinadores firmados de antes del cambio: siguen firmados.

## Resultado esperado

Los 9 puntos en verde (los precios y recuentos leídos del propio juego). Fallos → /speckit-converge.
