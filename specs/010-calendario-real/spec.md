# Especificación de la función: Calendario real y circuitos clásicos

**Rama de la función**: `010-calendario-real`

**Creada**: 2026-10-11

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Que los GP estén en el orden real. Añadir 5 circuitos famosos (Nürburgring, Le Mans, Estoril, Jerez y Kyalami) más aunque no sean de F1, y quitar el de Cataluña."

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - La temporada sigue el calendario de verdad (Prioridad: P1)

Como aficionado quiero que las rondas sigan el orden real del año —arranque en Australia, verano europeo, cierre en Yas Marina—, para que la temporada se sienta como la de verdad.

**Por qué esta prioridad**: es la corrección pedida primero y la que ordena todo lo demás (los nuevos circuitos tienen que entrar en su sitio).

**Prueba independiente**: la tabla de circuitos: 24 rondas, de Melbourne a Yas Marina, en orden cronológico real.

**Escenarios de aceptación**:

1. **Dado** el calendario, **cuando** lo recorro, **entonces** abre en Australia, sigue con las lejos de casa (Sudáfrica, Arabia, Japón, Azerbaiyán), el verano europeo en medio, y cierra en Yas Marina.
2. **Dado** dos rondas europeas consecutivas, **cuando** las comparo, **entonces** el orden respeta la realidad (Silverstone antes de Spa, Monza antes de Estoril…).
3. **Dado** una partida en marcha, **cuando** entra el cambio, **entonces** su progreso y resultados viajan al calendario nuevo sin perderse (migración).

---

### Historia de usuario 2 - Cinco clásicos en el mapa (Prioridad: P1)

Como aficionado quiero correr en Nürburgring, Le Mans, Estoril, Jerez y Kyalami, aunque no sean actuales de F1, y que Cataluña salga del calendario, para correr en los templos de siempre.

**Por qué esta prioridad**: es la adición pedida expresamente; junto con el orden, define la temporada.

**Prueba independiente**: la tabla de circuitos y la carrera en cada nuevo trazado: se reconocen (Le Mans y Jerez con su forma real; Nürburgring con su serpiente verde).

**Escenarios de aceptación**:

1. **Dado** el calendario, **cuando** lo miro, **entonces** están los 5 nuevos (con sus vueltas, desgaste y dificultad propios) y Cataluña ya no está: 24 rondas en total.
2. **Dado** Nürburgring, **cuando** corro, **entonces** el trazado es el larguísimo de verdad y castiga las gomas como ningún otro.
3. **Dado** una partida vieja, **cuando** se migra, **entonces** los resultados de Cataluña se retiran del historial (el circuito ya no existe) sin tocar el dinero ya ganado.

---

### Casos límite

- ¿Resultado guardado de Cataluña? Se quita del historial de temporada; el premio cobrado y los puntos de campeonato ya ganados se conservan en presupuesto y tablas (lo jugado, jugado).
- ¿Ronda en curso al migrar? El índice de ronda se conserva (acotado a la nueva longitud): no se repite ni se salta de golpe.
- ¿Trazado nuevo raro o cortado? Los 5 vienen de trazas GPS reales convertidas con el mismo proceso que los 20 originales; si uno fallara al cargar, la carrera cae al primer circuito del calendario (respaldo existente).
- ¿Ids de circuito al reordenar? Los ids pasan a ser por nombre (estables): reordenar el calendario en el futuro no vuelve a romper partidas.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El calendario DEBE ordenar sus rondas según el orden cronológico real de la temporada (apertura en Australia, verano europeo, cierre en Abu Dabi).
- **FR-002**: El juego DEBE incluir Nürburgring, Le Mans, Estoril, Jerez y Kyalami con trazados reales y personalidad propia (vueltas, desgaste, tiempo en boxes, dificultad), y DEBE excluir Cataluña: 24 rondas en total.
- **FR-003**: Los circuitos DEBEN tener identificadores estables por nombre, de modo que reordenar el calendario no invalide partidas guardadas.
- **FR-004**: Las partidas guardadas DEBEN migrar: calendario reconstruido, resultados re-mapeados al circuito equivalente, resultados de circuitos desaparecidos retirados del historial sin tocar economía ni campeonato acumulado, y ronda en curso conservada.
- **FR-005**: La generación del trazado y su verificación por tabla DEBEN seguir funcionando con 24 circuitos (informe y dibujos ASCII).

### Entidades clave

- **Circuito** (spec 005): mismo contrato; cambia su identificador (por nombre) y crece el catálogo (24).
- **Calendario**: la lista ordenada de rondas; su orden pasa a cronología real.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: La tabla de circuitos lista 24 rondas de Melbourne a Yas Marina en orden cronológico real, con los 5 nuevos presentes y Cataluña ausente.
- **SC-002**: Una partida guardada con progreso migra conservando presupuesto, campeonato y rada en curso; sin resultados de Cataluña.
- **SC-003**: Los 24 trazados se generan deterministas y distintos entre sí (dos ejecuciones, misma tabla).

## Supuestos

- El "orden real" es la cronología aproximada de la temporada actual con los clásicos intercalados donde correrían (Kyalami de apertura, Le Mans/Nürburgring en julio, Estoril y Jerez en el otoño europeo); el orden exacto vive en el plan y se puede reajustar.
- Nürburgring usa el trazado largo histórico (Nordschleife): es el circuito más largo y el que más castiga las gomas — su vuelta en juego dura lo mismo que las demás (la distancia es sabor, no física).
- Le Mans y Jerez se extrajeron de OpenStreetMap con el mismo proceso que los 20 originales (fuente de datos, no requisito).
