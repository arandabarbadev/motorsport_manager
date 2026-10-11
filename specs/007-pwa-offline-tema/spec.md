# Especificación de la función: Instalación, uso sin conexión y tema

**Rama de la función**: `007-pwa-offline-tema`

**Creada**: 2026-10-10

**Estado**: Borrador

**Entrada**: Descripción del usuario: "El juego se instala en el móvil como una app más, se juega sin conexión, siempre me llega la última versión publicada, y puedo cambiar entre tema oscuro y claro en cualquier pantalla." Especificación retrospectiva (misma carcasa que mi-semana 007, nacida aquí antes: service worker propio v1→v3).

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Instalarla como una app (Prioridad: P1)

Como jugador quiero el juego en la pantalla de inicio de mi móvil, abriéndolo a pantalla completa como una app de verdad, sin barra de navegador.

**Por qué esta prioridad**: en el navegador no se abre; en el inicio, sí: es la diferencia entre "un juego que tengo" y "un enlace que perdí".

**Prueba independiente**: añadir a pantalla de inicio y abrir: nombre, icono y pantalla completa.

**Escenarios de aceptación**:

1. **Dado** el móvil, **cuando** añado la web a la pantalla de inicio, **entonces** aparece con su icono y su nombre ("F1 Manager").
2. **Dado** el icono en el inicio, **cuando** lo abro, **entonces** abre a pantalla completa, como una app, con el color del juego en la barra del sistema.
3. **Dado** un navegador que ofrece instalación, **cuando** entra el juego, **entonces** aparece el botón "Instalar app" dentro de Mi Equipo; al pulsarlo, el diálogo del sistema.

---

### Historia de usuario 2 - Jugar sin conexión (Prioridad: P1)

Como jugador quiero abrir el juego en el bus sin cobertura y seguir mi temporada entera, porque mi partida vive en el dispositivo.

**Por qué esta prioridad**: la partida es local (y de la nube solo la copia, spec 006); que la falta de red impida jugar sería absurdo.

**Prueba independiente**: visitar el juego una vez, cortar la red, abrir de nuevo: el juego abre y se puede correr.

**Escenarios de aceptación**:

1. **Dado** el juego visitado al menos una vez, **cuando** abro sin conexión, **entonces** abre con la pantalla de entrada y la partida del navegador.
2. **Dado** sin conexión, **cuando** juego una carrera, **entonces** todo funciona: la partida nunca dependió de la red.
3. **Dado** sin conexión, **cuando** miro mi partida, **entonces** está entera: solo la copia de la nube espera a haber red.

---

### Historia de usuario 3 - Siempre la última versión (Prioridad: P2)

Como jugador quiero que los arreglos publicados me lleguen sin hacer nada, y que la caché vieja no me los esconda.

**Por qué esta prioridad**: es la lección de la constitución (L2): la caché vieja ya escondió arreglos una vez — en este juego, de hecho, nació la solución (fondo v2).

**Prueba independiente**: publicar un cambio y abrir el juego: llega la versión nueva sin borrar nada manualmente.

**Escenarios de aceptación**:

1. **Dado** una versión nueva publicada, **cuando** abro el juego, **entonces** la página se pide a la red primero y me llega la nueva.
2. **Dado** el fondo de la app actualizándose en segundo plano, **cuando** termina, **entonces** las cachés de versiones viejas desaparecen: la siguiente apertura ya es la nueva, sin acciones manuales.

---

### Historia de usuario 4 - Oscuro o claro, a mi gusto (Prioridad: P2)

Como jugador quiero alternar tema oscuro y claro desde cualquier pantalla y que se recuerde, para jugar como me apetezca según la luz.

**Por qué esta prioridad**: es comodidad diaria; no es imprescindible para jugar.

**Prueba independiente**: cambiar el tema en la carrera: el circuito cambia de colores y el resto de pantallas también; al recargar, sigue.

**Escenarios de aceptación**:

1. **Dado** cualquier pantalla (entrada, equipo, carrera, temporada), **cuando** pulso el botón de tema, **entonces** toda la interfaz cambia entre oscuro y claro.
2. **Dado** el tema cambiado, **cuando** recargo o vuelvo otro día, **entonces** se recuerda (oscuro por defecto la primera vez).
3. **Dado** la carrera abierta, **cuando** cambio el tema, **entonces** el circuito repinta sus colores (asfalto, bordes) al instante.

---

### Historia de usuario 5 - Cambios de pantalla sin saltos (Prioridad: P3)

Como jugador quiero que los cambios de pantalla (entrar, ir a carrera, temporada) tengan el mismo fundido suave, para que el juego se sienta cuidado.

**Por qué esta prioridad**: es pulido; el juego funciona igual sin él.

**Prueba independiente**: navegar entre pantallas: misma transición corta en todas.

**Escenarios de aceptación**:

1. **Dado** cualquier cambio de pantalla principal, **cuando** ocurre, **entonces** la actual se funde out y la nueva entra con la misma animación breve, en todas.

---

### Casos límite

- ¿Primera visita sin conexión? No hay nada cacheado: el navegador muestra su error; no se promete lo imposible.
- ¿Botón "Instalar app" rechazado o no ofrecido (iOS)? El botón no aparece; en iOS se instala desde Compartir → Añadir a pantalla de inicio (el juego lo permite igualmente).
- ¿Servidor caído con conexión? La navegación cae a la copia cacheada: el juego abre (última versión vista).
- ¿Cambiar de tema con la carrera en pausa? La capa del circuito repinta igual: el estado de la carrera no se toca.
- ¿Fuentes o módulos de la nube caídos? Se cachean al visitarlos una vez: el offline no depende de ellos.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El juego DEBE poder añadirse a la pantalla de inicio con nombre e iconos propios (incluido el adaptable que rellena cualquier forma) y abrir a pantalla completa con su color en la barra del sistema; cuando el navegador ofrece instalación, DEBE mostrarse un botón para lanzarla.
- **FR-002**: Tras una visita con conexión, el juego DEBE abrir sin conexión y ser jugable con la partida del navegador.
- **FR-003**: La página del juego DEBE pedirse a la red primero (revalidada) y servirse la copia guardada solo cuando no haya red; los archivos con huella en el nombre DEBEN servirse de caché (son inmutables).
- **FR-004**: Al activarse una versión nueva del fondo de la app, las cachés de versiones anteriores DEBEN borrarse, y la versión nueva DEBE tomar el control sin esperar.
- **FR-005**: El registro del fondo de la app DEBE ocurrir solo en la versión de producción servida por http/https, nunca en desarrollo.
- **FR-006**: El juego DEBE ofrecer tema oscuro/claro desde todas sus pantallas, recordarlo entre sesiones (oscuro por defecto) y repintar el trazado de la carrera al cambiarlo.
- **FR-007**: Todos los cambios de pantalla principales DEBEN usar la misma transición breve de fundido.
- **FR-008**: La partida del jugador NUNCA depende de la caché de la app: vive en el navegador (y su copia, en la nube de la cuenta, spec 006).

### Entidades clave

- Sin entidades de datos propias: es la carcasa que envuelve a las specs 001-006. Sus preferencias (el tema) son una marca en el navegador, por dispositivo.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: Instalado desde el icono, abre a pantalla completa el 100 % de las veces.
- **SC-002**: Sin conexión, el juego abre y una carrera se puede jugar al completo.
- **SC-003**: Tras publicar una versión nueva, la siguiente apertura muestra la nueva sin pasos manuales.
- **SC-004**: El cambio de tema repinta todas las pantallas, incluida la pista, sin recargar.

## Supuestos

- Especificación retrospectiva: manifiesto, iconos, fondo (v3), botón de instalación, tema y transiciones ya existen; el offline se verificó en vivo (red cortada) y la instalación, con el móvil de Rafa.
- El botón de instalación depende de que el navegador ofrezca el diálogo; donde no (iOS), la instalación manual del sistema vale igual.
- Todo en español (Constitución IV).
