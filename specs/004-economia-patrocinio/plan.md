# Plan de implementación: Economía, patrocinio y sede

**Rama**: `004-economia-patrocinio` | **Fecha**: 2026-10-10 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de la función en `specs/004-economia-patrocinio/spec.md`

## Resumen

Plan retrospectivo **sin cambios de código**: premios, contabilidad por carrera, 100 patrocinadores, sede con personal y reinicio total ya existen y persisten. Se documentan los números de equilibrio y se verifican en código y en vivo.

## Contexto técnico

**Lenguaje/Versión**: TypeScript 5.9, módulos ES, DOM directo.

**Dependencias principales**: ninguna nueva (motor 001, plantilla 003). Pila del proyecto: excepción documentada en el plan de 001.

**Almacenamiento**: `localStorage["f1manager:career:v1"]` (economía completa en JSON, con versión para migrar); clave compartida con la sincronización (spec 006).

**Testing**: lectura de código + verificación en vivo (contratar, cobrar, reiniciar) + cálculo manual del balance contra el panel.

**Plataforma objetivo**: navegador de escritorio y móvil.

**Tipo de proyecto**: pantalla de gestión y contabilidad del juego web monolítico.

**Objetivos de rendimiento**: ninguna exigencia especial (operaciones aritméticas).

**Restricciones**: el premio se aplica exactamente una vez por carrera (guardia anti-repetición); sin claves (II).

**Escala/Alcance**: 100 patrocinadores generados de forma determinista; 3×5 niveles de personal.

## Números de equilibrio (viven aquí, no en la spec)

| Concepto | Valor | Dónde |
|---|---|---|
| Tabla de premios (por coche) | P1 100 · P2 80 · P3 65 · … decreciente hasta P20 1 M€ | prize-table.ts:8-11 |
| Sueldo por piloto | 4 M€/carrera (×2 = 8) | finance.ts:11 |
| Alquiler de instalaciones | 6 M€/carrera | finance.ts:12 |
| Sueldo de personal | 2 M€ por nivel total por carrera | finance.ts:13 |
| Gasto fijo inicial | 20 M€/carrera (8+6+3×2), escala hasta 36 con sede al máximo | finance.ts:37-52 |
| Patrocinadores | 100; paga 0,5→5,0 M€ lineal por ranking; exigen P20→P1 | sponsors.ts:33-48 |
| Firmados a la vez | 5 (elección de Rafa 2026-10-03) | sponsors.ts:31 |
| Bonus comerciales | +5 % de ingreso por nivel (sobre nivel 1) | finance.ts:26-35 |
| Coste de sede | nivel actual × 30 M€ (1→2 = 30; 4→5 = 120) | career.ts:23-24,66-68 |
| Efecto mecánicos | −1,5 s por parada y nivel (mínimo 10 s) | race-builder.ts:91-98 |
| Efecto ingenieros | −5 % de coste de desarrollo por nivel | team-screen.ts:273 |
| Presupuesto inicial | 350 M€ (elección de Rafa) | roster.ts:18 |

## Constitution Check

| Principio / lección | Estado | Nota |
|---|---|---|
| I. Spec antes que código | ✔ | Retrospectivo |
| II. Privacidad | ✔ | Empresas ficticias generadas; nada personal |
| III. Sin dependencias | ✔ | Nada nuevo |
| IV. Móvil primero | ✔ | Listas y botones táctiles |
| V. Se entiende sin explicación | ✔ | Botones dicen lo que exigen ("P5", "Completo", "MÁX"); balance con partidas con signo |
| VI. No perder datos | ✔ | Reinicio y regeneración con confirmación; guardado al momento |
| VII. Requisito comprobable | ✔ | quickstart con cuentas a mano |
| VIII. Todo en mi carpeta | ✔ | specs/ en el repo local |
| IX. Evidencias | ✔ | Código citado + verificación viva |
| L1 | ✔ | Clase `.hidden` |
| L2 | N/A | SW de la spec 007 |

**Puerta: PASA.**

## Estructura del proyecto

### Documentación (esta función)

```text
specs/004-economia-patrocinio/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── checklists/requirements.md
```

### Código fuente y puntos de contacto (sin cambios)

```text
src/career.ts        # Estado de economía (presupuesto, sede, patrocinadores) + carga con migraciones
src/finance.ts       # Contabilidad de carrera: ingreso de patrocinio y balance neto
src/prize-table.ts   # Premios por posición (por coche)
src/sponsors.ts      # 100 patrocinadores generados, desbloqueo por resultado, límite de 5
src/team-screen.ts   # Pestañas "Sede" y "Patrocinadores", botón Reiniciar, pago de niveles
src/race-screen.ts   # Pago único al terminar carrera + panel del balance
src/storage-keys.ts  # Clave "f1manager:career:v1"
```

## Seguimiento de complejidad

> Sin entradas: no hay violaciones que justificar (la pila del proyecto está justificada en el plan de 001).
