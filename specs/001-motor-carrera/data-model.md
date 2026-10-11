# Modelo de datos: Motor de simulación de carrera

**Fase 1** · 2026-10-10

Contrato entre el motor, la IA de rivales y el render (src/types.ts). Nada de esto conoce Canvas ni el DOM.

## Entidad: Estado de carrera (RaceState)

La foto completa de una carrera en memoria:

| Campo | Tipo | Notas |
|---|---|---|
| pista | Pista | En qué circuito se corre |
| clima | seco / lluvia ligera / lluvia fuerte | Puede cambiar por pasos |
| coches | Coche en carrera × 20 | La parrilla |
| equipos, pilotos, specs de coche | listas | Busca por id dentro del tick (respaldo 70 si falta uno) |
| tickActual | número | Avanza uno por tick |
| multiplicador de tiempo | 1 / 5 / 10 / 20 | Segundos simulados por tick |
| pausa | booleano | El tick no avanza nada |
| bandera | verde / amarilla / roja | Estado del control de carrera |
| temporizador de bandera | s | Lo que queda de amarilla/roja |
| eventos de carrera | Evento[] | Generados ESTE tick; se reemplazan al siguiente |
| elClimaPuedeCambiar | booleano | false = carrera seca de principio a fin (lotería de la spec 005) |

## Entidad: Coche en carrera (RaceCarState)

| Campo | Tipo | Notas |
|---|---|---|
| idPiloto / idCoche / idEquipo | texto | Enlaces a las listas |
| progresoVuelta | 0..1 | Posición dentro de la vuelta |
| vueltaActual | número | Vueltas completadas |
| goma | TyreState | Compuesto (blando/medio/duro/lluvia), desgaste 0-100, vueltas con ella |
| huecoConLíder (s) | número | Recalculado cada tick |
| posición | 1..20 | Recalculada cada tick |
| paradasHechas | número | Contador |
| estado | corriendo / enBoxes / DNF | Ciclo de vida en carrera |
| controladoPorElJugador | booleano | true = sus paradas son solo manuales |
| temporizadorBoxes (s) | número | >0 mientras está en boxes |
| anulaciónPérdidaBoxes (s) | opcional | Lo que tarda SU parada (mecánicos de la spec 004); si no, lo de la pista |

## Entidades de plantilla (leídas por el motor)

- **Piloto (Driver)**: ritmo, consistencia, agresividad, habilidad en mojado, tolerancia al riesgo (0-100) + nombre.
- **Coche (Car)**: aero, motor, chasis (ritmo = media de los tres) y fiabilidad (averías) + equipo.
- **Equipo (Team)**: nombre, presupuesto, color (el color lo consume el render, no el motor).
- **Pista (Track)**: trazado (puntos x,y), vueltas totales, dificultad de adelantamiento, factor de desgaste de gomas y pérdida de tiempo en boxes (s).

## Entidades efímeras

- **Orden de boxes (PitCommand)**: piloto + compuesto nuevo + tick en que se pidió. Cola global → mapa de pendientes → se ejecuta al cruzar meta. Se ignora duplicada para el mismo piloto.
- **Evento de carrera (RaceEvent)**: adelantamiento (posición previa/nueva) o entrada a boxes. Vida de un tick: el render los consume (spec 002).

## Relación con las demás funciones

- La parrilla y los specs efectivos los construye la spec 003 (equipo + rivales + desarrollos).
- Las claves de persistencia son de las specs 003-005; el motor no persiste nada.
