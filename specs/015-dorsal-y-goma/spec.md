# Spec 015 — Dorsal en el coche y goma propia

## Contexto

El dorsal (spec 008) se pinta FUERA del círculo del coche, flotando 2,1 radios por encima; en pantallas pequeñas y con coches solapándose cuesta saber cuál es cuál. La tabla de clasificación muestra la goma y el desgaste de los 20 coches, información que solo importa para las estrategias propias. Y en "Mis boxes" se elige la goma nueva sin ver la que llevan tus coches.

Además, al revisar el render se ha encontrado un bug real: `drawCars` hace `return` (en vez de `continue`) al pintar un fantasma DNF, así que en cuanto un coche roto cae al último puesto del bucle, **el resto de coches desaparece del canvas** ese frame y todos los siguientes.

## Historias de usuario

- **HU1 (P1)** — Como jugador, quiero el dorsal DENTRO del circulito de cada coche, para identificarlo de un vistazo sin texto flotando encima.
- **HU2 (P1)** — Como jugador, quiero que la goma y su desgaste de la tabla solo aparezcan para MIS dos pilotos, porque la estrategia de los rivales no me aporta y ensucia la tabla.
- **HU3 (P1)** — Como jugador, quiero ver la goma actual (compuesto y desgaste) de cada uno de mis coches justo donde les cambio las ruedas ("Mis boxes"), para decidir la parada sin buscar la tabla.

## Requisitos funcionales

- **FR-001**: el dorsal se dibuja centrado dentro del círculo del coche, con contorno oscuro para leerse sobre cualquier color de equipo y en ambos temas. Ya no hay texto de dorsal fuera del círculo.
- **FR-002**: las filas de rivales de la tabla de clasificación no muestran compuesto ni barra de desgaste (celdas vacías, hueco reservado para no romper la alineación). Las filas de tus pilotos las siguen mostrando.
- **FR-003**: cada box de "Mis boxes" muestra una línea de goma actual: compuesto (S/M/H/W con su color), barra de desgaste y porcentaje, actualizada en vivo durante la carrera.
- **FR-004** (bugfix): todos los coches se pintan siempre; un DNF se salta con `continue`, nunca corta el bucle de dibujo.

## Requisitos no funcionales

- Motor de simulación intacto: solo cambia el render y el HUD.
- Legible en móvil (lienzo bajo, ~38vh): el radio mínimo del coche sube de 4 a 7 px para que quepa el dorsal.
- La guía de primera visita de la pantalla de carrera se actualiza al nuevo comportamiento.

## Escenarios

- **SC-001**: en la parrilla (formación), los 20 círculos llevan su dorsal dentro; no queda texto blanco de dorsales por encima de los círculos.
- **SC-002**: a mitad de carrera, la tabla muestra goma/desgaste solo en las 2 filas del jugador; las 18 de rivales van vacías en esas celdas.
- **SC-003**: en "Mis boxes", cada coche muestra "M · ████ 34 %" que crece con las vueltas y cambia de compuesto tras una parada.
- **SC-004**: tras una avería/abandono, los coches restantes siguen pintándose (el fantasma se dibuja y el bucle continúa).

## Casos límite

- Dorsal de 2 dígitos (hasta 20) dentro del círculo a radio mínimo.
- Coche en boxes (radio ×0,75): el dorsal escala con el círculo.
- Desgaste 0 % al inicio: barra vacía y "0 %".
- Tema claro y oscuro: contraste del dorsal garantizado por contorno oscuro + relleno blanco.
