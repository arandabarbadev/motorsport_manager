# Checklist de requisitos 018

- [x] FR-001 — Jerez real: geojson ensamblado de los ways raceway de OSM (4,426 km), regenerado por el pipeline del tool sin cambios.
- [x] FR-002 — Calendario de 20 rondas: fuera Kyalami, Le Mans, Nürburgring y Estoril (Jerez se queda), en perfiles, layouts y tool.
- [x] FR-003 — Migración: careers cargan calendario de 20; resultados de rondas retiradas descartados; presupuesto y avance intactos.
- [x] FR-004 — Línea blanca de borde con halo oscuro alrededor del asfalto, visible en ambos temas.
- [x] FR-005 — Sin fusiones: carretera 0,06 + descolisión (mín ≥ 0,078 entre tramos no vecinos); Singapur/Mónaco/Yeda legibles.
- [x] FR-006 — Goma inter: mejor en lluvia ligera, penalizada en seco/fuerte (tablas compound×tiempo en pace y desgaste); botón I verde en Mis boxes.
- [x] FR-007 — IA: lightRain→inter, heavyRain→wet, dry→slicks; conjuntos adecuados por tiempo.
- [x] FR-008 — Aviso del hub 017 al cambiar el tiempo: ligera (info), fuerte (alert), escampa (success), con la goma recomendada.
- [x] NFR — Harness: sin regresión + "Tracks check" (20/Jerez/separación) + "Weather check" (IA para a inter bajo lluvia ligera).
- [x] NFR — En seco, ritmo y desgaste idénticos a hoy (tablas dry ×1).
