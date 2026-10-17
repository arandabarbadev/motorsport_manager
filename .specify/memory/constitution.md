# Constitución personal de Rafa
<!-- Vale para todas las apps que construyo, no solo para este proyecto. -->

## Principios

### I. Spec antes que código
Ninguna funcionalidad se implementa sin un spec.md que yo haya leído. La spec dice QUÉ y POR QUÉ, nunca CÓMO: en la spec no aparecen tecnologías, botones, colores ni pantallas. Todo eso va en el plan.

### II. Privacidad
El repositorio es público. Nunca se suben datos personales: ni mi email, ni nombres de profesores o compañeros, ni mis notas, tareas o dinero. Los datos del usuario viven en su navegador.

### III. Sin dependencias por defecto
HTML, CSS y JavaScript puros, sin librerías, frameworks, fuentes externas ni servicios de terceros. Usar uno es una excepción: se justifica por escrito en el plan, explicando qué problema resuelve y qué alternativa sin dependencias se descartó, y el cliente tiene que aprobarla. Nunca se añade una dependencia en silencio.

### IV. Móvil primero
Se diseña para usarse con una mano, de pie, en el móvil. En el portátil también funciona, pero el móvil manda. Todo el texto en español.

### V. Se entiende sin explicación
Una persona que no ha visto la app la usa sin que nadie le explique nada. Cuando no hay datos, la pantalla dice qué hacer, nunca aparece vacía.

### VI. El usuario no pierde datos sin enterarse
Borrar algo pide confirmación o se puede deshacer. Si los datos solo viven en un navegador, la app lo dice claramente.

### VII. Todo requisito se puede comprobar usándolo
Cada spec incluye criterios de "hecho cuando" que se verifican con la app en la mano, sin mirar el código.

### VIII. Todo lo que se genera, lo tengo en mi carpeta
- Cada archivo que crea o modifica el agente existe en la carpeta del proyecto abierta en VS Code, en mi portátil: las specs, planes, tareas y constitución de Spec Kit, y el código. Tengo que poder abrirlo, leerlo y editarlo desde el explorador de VS Code en cuanto el agente lo termina.
- Nunca se crea ni se modifica nada solo en GitHub. Si el agente usa la API de GitHub o cualquier herramienta remota, lo que cambie allí tiene que estar también en mi carpeta local, y en ese mismo momento.
- Al terminar cada comando de Spec Kit o cada tarea, el agente me dice qué archivos ha creado o cambiado y en qué ruta de mi carpeta están, para que vaya a revisarlos.
- Si la carpeta abierta no es un repositorio Git conectado a mi GitHub, el agente se detiene, me lo explica y me dice cómo arreglarlo antes de seguir.
- Ningún token, contraseña ni clave aparece en archivos, comandos o mensajes de commit.

Motivo: el agente estaba trabajando sin que los archivos estuvieran en mi carpeta, y así no puedo revisar lo que se genera, que es la mitad de mi trabajo.

### IX. Evidencias, no promesas
Cuando se verifica que algo funciona, se enseña la evidencia: una captura de la app real, la salida del comando que se ejecutó, o el estado comprobado que se leyó. Un "funciona" sin evidencia no cuenta como verificado. Si no se puede mostrar evidencia, se dice qué falta y cómo se comprobará.

Motivo: revisar lo que hace el agente es la mitad de mi trabajo, y sin evidencia solo me queda creerle.

### X. La carpeta del proyecto, abierta y a la vista
Siempre que se empiece cualquier tarea en un proyecto, su carpeta tiene que estar abierta en el Explorador de Windows (explorer.exe) antes de tocar nada, y el agente me avisa de que la ha abierto. Todo lo que el agente hace tiene que poder verse en esa carpeta mientras trabaja: la spec y las tareas de la función activa (con sus casillas marcándose), y el código cambiando. Si la tarea genera archivos, viven en esa carpeta (regla VIII); si el agente trabaja en otra carpeta que no está abierta, la abre primero en el Explorador y me avisa.

Motivo: trabajar a ciegas en un proyecto que no tengo abierto me deja fuera; poder mirar la carpeta en el Explorador y ver qué cambia es cómo reviso sobre la marcha.

### XI. Higiene de tokens: recordar /compact
Cada turno paga otra vez toda la conversación, así que las sesiones largas se encarecen solas. Cuando llegue un buen momento para compactar —al cerrar una función, tras una verificación con salidas largas, o antes de empezar otra función—, el agente se lo recuerda a Rafa para que ejecute /compact o abra una conversación nueva (el estado vive en las specs, los archivos y los commits, no en el chat). El recordatorio va dentro del mensaje de cierre de la tarea, sin interrumpir el trabajo.

Motivo: las sesiones gigantes quemaban tokens sin que Rafa pudiera evitarlo; el aviso en el momento justo es lo que le da el control.

## Lecciones aprendidas
<!-- Reglas técnicas obligatorias para el plan y la implementación. -->

### L1. El atributo hidden siempre oculta
Toda app incluye la regla CSS `[hidden] { display: none !important; }`. Motivo: un display en el CSS anulaba hidden y la app se quedaba atascada detrás de una pantalla de carga (pasó dos veces, en mi-semana y en mis-finanzas).

### L2. El HTML se pide a la red primero
Si la app tiene service worker, el HTML se pide a la red primero y la caché solo se usa sin conexión. Motivo: la caché vieja impedía que llegaran los arreglos publicados.

## Gobierno

- Esta constitución tiene prioridad sobre cualquier plan o tarea. Si el plan la incumple, se dice en el Constitution Check y se justifica o se corrige.
- Cada vez que un error me cueste tiempo, se añade aquí como lección nueva y se sube la versión.

**Versión**: 1.4.0 | **Ratificada**: 2026-10-04 | **Última enmienda**: 2026-10-17
