# Investigación y decisiones: Dorsales visibles y guía de primera vez

**Fase 0** · 2026-10-10

## D1. Dorsal numérico, no inicial

- **Decisión**: número 1-20 asignado al crear la plantilla, dibujado sobre el punto.
- **Por qué**: las iniciales colisionan (Driver 1 y Driver 10 comparten "D") y en 20 coches un número se lee más rápido que dos letras; y en la F1 real los coches llevan números.
- **Alternativas descartadas**: iniciales (colisiones, legibilidad); formas por equipo (16 formas vs 10 colores — más ruido visual); borde más grueso (no resuelve el problema de fondo).

## D2. Contraste garantizado con doble trazo

- **Decisión**: texto claro con contorno oscuro encima del punto (y el punto conserva su borde de equipo).
- **Por qué**: cualquier color de equipo sobre asfalto claro u oscuro mantiene la lectura; sin contorno, amarillo sobre blanco se pierde.
- **Alternativas descartadas**: calcular luminancia del color para elegir negro/blanco (correcto pero frágil con temas); fondo chapa detrás del número (engorda el dibujo en móvil).

## D3. La guía es una tarjeta, no un tour por pasos

- **Decisión**: una tarjeta flotante por pantalla con 3-4 líneas y botón "Entendido"; nada de burbujas secuenciales.
- **Por qué**: un tour de varios pasos exige interacción para ver la primera idea completa; la tarjeta se lee de un vistazo y se cierra.
- **Alternativas descartadas**: tour paso a paso (fricción); tooltips al pasar por botones (no se descubre en móvil).

## D4. Marca por navegador, no por partida

- **Decisión**: `f1manager:tutorial:v1` con un flag por pantalla; no viaja a la nube ni a las partidas.
- **Por qué**: quien ya aprendió no quiere re-ver guías al crear una partida nueva (y menos en otro dispositivo); es conocimiento del jugador, no de la partida.
- **Alternativas descartadas**: flag por partida (re-explica); por cuenta en la nube (dependencia de red para un dato local).

## D5. El dorsal persiste en la plantilla, no se calcula

- **Decisión**: campo del piloto asignado en la creación y regeneración; migración para plantillas viejas (sin dorsal) por posición.
- **Por qué**: si se calcula al vuelo, regenerar rivales o reordenar cambiaría el dorsal de un piloto entre carreras (FR-003 lo prohíbe).
- **Alternativas descartadas**: derivar del índice en carrera (inestable); dorsales editables (nadie lo pidió).
