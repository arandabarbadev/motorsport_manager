# Investigación y decisiones: Economía, patrocinio y sede

**Fase 0** · 2026-10-10

## D1. Premios por coche, no por equipo

- **Decisión**: la tabla de premios se paga a cada uno de mis dos coches según su posición; el "resultado de temporada" que registra la carrera es el mejor de los dos.
- **Por qué**: premia las dos tácticas (un ariete y un escudero) y hace que la segunda coche importe; la tabla decreciente mantiene el incentivo de subir puestos.
- **Alternativas descartadas**: premio solo al mejor (el segundo coche da igual); premio plano por participar (sin tensión).

## D2. Gastos fijos visibles en cada carrera

- **Decisión**: cada carrera resta sueldos de pilotos (8), alquiler (6) y sueldos de personal (2 por nivel total): ~20 M€ de base que crecen con la sede.
- **Por qué**: obliga a que el ingreso (premios + patrocinio) cubra la estructura: firmar patrocinadores deja de ser decorativo; y el coste de la sede se siente en el balance, no solo al comprarla.
- **Alternativas descartadas**: gastos solo al comprar (sin sensación de estructura); nómina anual (menos legible).

## D3. Escalera de 100 patrocinadores con puerta por resultado

- **Decisión**: 100 empresas generadas con pago 0,5→5 M€ y exigencia P20→P1; se firman hasta 5; el desbloqueo mide el MEJOR resultado de la temporada actual; sin resultados, solo los que no exigen nada.
- **Por qué**: da recorrido al medio juego (cada mejora de resultado abre patrocinadores) y una decisión nueva (cuáles de los abiertos firmo); lo firmado no se pierde (la puerta es para firmar).
- **Alternativas descartadas**: un solo patrocinador (lo había al principio: se amplió a 5 el 2026-10-03 por petición de Rafa); desbloqueo por temporada completada (demasiado lento).

## D4. Sede = tres palancas, no un árbol de tecnologías

- **Decisión**: tres tipos de personal con nivel 1-5 y coste creciente (nivel × 30 M€): mecánicos (−1,5 s por parada/nivel), ingenieros (−5 % coste de desarrollo/nivel), comerciales (+5 % patrocinio/nivel).
- **Por qué**: tres decisiones claras que compiten por el mismo dinero que el coche (spec 003); niveles cortos (5) hacen cada subida notoria.
- **Alternativas descartadas**: edificios y árbol tech (alcance desmedido para el juego); niveles 1-10 (subidas invisibles).

## D5. Pago una sola vez, con guardia anti-repetición

- **Decisión**: al terminar la carrera, el premio se cobra y el resultado se registra de una vez, con una marca en pantalla y otra en el historial de temporada; una carrera ya registrada no vuelve a cobrar ni registrar, pero el calendario sigue avanzando.
- **Por qué**: el botón "Nueva carrera" y los replays no pueden ser una máquina de dinero (FR-007); y la temporada jamás puede quedarse clavada por repetir.
- **Alternativas descartadas**: fiarse del estado de la pantalla (una recarga lo pierde); bloquear repetir sin más (castiga sin necesidad).

## D6. Reinicio total, no borrado selectivo

- **Decisión**: un único botón Reiniciar con confirmación que enumera qué se pierde (dinero, patrocinador, desarrollos, sede, temporada) y qué queda (nombres de mi equipo y rivales).
- **Por qué**: lo que se quiere al reiniciar es volver al día 1 con la identidad ya escrita; opciones parciales añaden pantallas y dudas.
- **Alternativas descartadas**: reinicios por partes (más UI, más confusiones).

## D7. Migraciones hacia delante en la carga

- **Decisión**: la carga de la economía fusiona con valores por defecto y convierte formatos viejos (patrocinador único → lista) sin perder el dinero.
- **Por qué**: el juego evolucionó en vivo (premio único → 5, sin sede → con sede); la partida de Rafa tenía que sobrevivir a cada cambio.
- **Alternativas descartadas**: versión estricta que descarta guardados viejos (perder la partida por actualizar).
