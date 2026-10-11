# Especificación de la función: Cuenta y sincronización

**Rama de la función**: `006-cuenta-sincronizacion`

**Creada**: 2026-10-10

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Entrar con mi cuenta (correo o Google) para tener la partida en la nube y seguir en cualquier dispositivo, o seguir sin cuenta jugando solo en este navegador. La nube nunca me pisa la partida local sin avisar." Especificación retrospectiva (misma función que en mi-semana, adaptada al juego).

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Jugar sin cuenta (Prioridad: P1)

Como jugador quiero entrar directo sin cuenta y tener la partida completa en mi navegador, para probar el juego sin dar mi correo.

**Por qué esta prioridad**: la barrera de registro antes de jugar mata las ganas; el modo local es la puerta de entrada.

**Prueba independiente**: "Continuar sin cuenta": todo el juego (equipo, economía, temporada) funciona y persiste en ese navegador.

**Escenarios de aceptación**:

1. **Dado** la pantalla de entrada, **cuando** pulso "Continuar sin cuenta (solo este navegador)", **entonces** entro al juego completo con todo guardado en el navegador.
2. **Dado** el modo local, **cuando** hago cualquier cosa (correr, comprar, editar), **entonces** nada depende de la red: puedo jugar en el bus.
3. **Dado** el juego sin configurar la nube, **cuando** abro, **entonces** entra igual y la pantalla de entrada lo explica.

---

### Historia de usuario 2 - Mi partida en la nube (Prioridad: P1)

Como jugador quiero registrarme o entrar con mi correo (o con Google en un clic) y que mi partida viaje conmigo, para seguir en el móvil lo que empecé en el portátil.

**Por qué esta prioridad**: es la promesa de la cuenta: partir donde lo dejé, en cualquier dispositivo.

**Prueba independiente**: entrar con la cuenta en un navegador sin partida: aparece la partida guardada en la nube.

**Escenarios de aceptación**:

1. **Dado** la pantalla de entrada, **cuando** me registro con correo y contraseña (o entro si ya tengo cuenta), **entonces** entro al juego con mi sesión abierta.
2. **Dado** el botón de Google, **cuando** lo pulso, **entonces** entro con mi cuenta de Google en un clic.
3. **Dado** credenciales erróneas o un fallo de red, **cuando** intento entrar, **entonces** la pantalla muestra el error y me deja reintentar (no se queda colgada).
4. **Dado** sesión abierta, **cuando** cierro y vuelvo a abrir el juego, **entonces** la sesión se restaura sola y entro directo a mi partida.
5. **Dado** un dispositivo nuevo sin partida local, **cuando** entro con mi cuenta, **entonces** mi partida de la nube baja y sigo donde estaba.

---

### Historia de usuario 3 - La nube sin sustos (Prioridad: P2)

Como jugador quiero reglas claras de quién manda entre la nube y el navegador, para no perder partida por una sincronización despistada.

**Por qué esta prioridad**: la confianza en el guardado es lo que permite invertir horas; un borrado silencioso mata el juego.

**Prueba independiente**: entrar con la cuenta habiendo una partida local distinta: la de la nube manda y la app se recarga una vez con ella.

**Escenarios de aceptación**:

1. **Dado** partida local y de la nube DISTINTAS al entrar, **cuando** se completan, **entonces** la de la nube es la buena: se aplica y la app se recarga una sola vez con ella.
2. **Dado** partida local y de la nube IGUALES, **cuando** se completan, **entonces** no pasa nada (ni recargas ni subidas en bucle).
3. **Dado** una cuenta sin nada en la nube, **cuando** entro, **entonces** mi partida local sube: lo primero que había gana.
4. **Dado** partida nueva (carrera, compra, edición) con sesión abierta, **cuando** dejo de tocar un momento, **entonces** se sube agrupada, sin saturar la red con cada letra.
5. **Dado** sin conexión al guardar, **cuando** falla la subida, **entonces** sigo jugando en local y el siguiente cambio vuelve a intentarlo.
6. **Dado** la partida, **cuando** viaja, **entonces** viaja entera (equipo + economía con su temporada): nunca a medias.

---

### Historia de usuario 4 - Salir de la cuenta (Prioridad: P3)

Como jugador quiero cerrar la sesión y que otro pueda usar el juego en este navegador sin ver mi partida, para compartir dispositivo sin mezclar.

**Por qué esta prioridad**: higiene de cuenta: importa, pero es raro.

**Prueba independiente**: "Salir": vuelve a la pantalla de entrada; al entrar en modo local, parte de lo que haya en el navegador.

**Escenarios de aceptación**:

1. **Dado** sesión abierta, **cuando** pulso "Salir", **entonces** la sesión se cierra y el juego vuelve a la pantalla de entrada.
2. **Dado** sesión cerrada, **cuando** el botón, **entonces** ya no aparece en la cabecera.

---

### Casos límite

- ¿Entrar con la nube caída? No se puede bajar la partida, pero el error no bloquea: se juega en local y la próxima sincronización lo arregla.
- ¿Dos dispositivos escribiendo a la vez? La última subida pisa la anterior (la nube guarda una copia por cuenta); al entrar, gana la nube (regla 1).
- ¿Tema claro/oscuro? Es del dispositivo, no de la cuenta: no viaja (spec 007).
- ¿Contraseña olvidada? Se recupera desde el proveedor de la cuenta (no es cosa del juego).
- ¿Registro con correo mal formado? La pantalla del proveedor da el error y el juego lo pinta tal cual.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El juego DEBE poder jugarse completo sin cuenta, con toda la partida en el navegador, y la pantalla de entrada DEBE ofrecerlo con claridad (avisando de que es solo ese navegador).
- **FR-002**: El juego DEBE ofrecer registro y acceso con correo y contraseña y acceso con Google; los errores del proveedor DEBEN mostrarse y permitir reintentar.
- **FR-003**: Con sesión abierta, el juego DEBE restaurarla al arrancar sin pedir nada y entrar directo a la partida.
- **FR-004**: Al entrar con cuenta: si la partida de la nube difiere de la local, la DE LA NUBE debe ganar y aplicarse con una única recarga; si son iguales, no hacer nada; si la nube está vacía, subir la local.
- **FR-005**: Con sesión abierta, cada cambio de partida DEBE subirse agrupado tras un pequeño alto, y un fallo de red NO debe impedir seguir jugando en local (se reintenta en el siguiente cambio).
- **FR-006**: La partida DEBE viajar siempre entera (plantilla + economía con su temporada), nunca por partes.
- **FR-007**: El cierre de sesión DEBE estar disponible siempre que haya sesión y volver a la pantalla de entrada.
- **FR-008**: Las claves del servicio de nube NUNCA deben subir al repositorio.

### Entidades clave

- **Sesión**: quién juega (identificador de cuenta); sin sesión, modo local.
- **Partida en la nube**: una copia completa de la partida por cuenta (plantilla y economía como texto guardado), junto con la pantalla que las creó.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: El arranque con sesión restaurada entra a la partida sin tocar nada el 100 % de las veces.
- **SC-002**: Tras un cambio de partida, la copia de la nube refleja el cambio en menos de unos segundos, sin que el juego se note entrecortado.
- **SC-003**: Al entrar con conflicto, exactamente una recarga ocurre (nunca dos, nunca cero con datos viejos).
- **SC-004**: Ningún escenario de red (sin conexión al entrar, al guardar) pierde la partida local.

## Supuestos

- Especificación retrospectiva: el servicio de nube (Firebase) ya está elegido y configurado por Rafa; su excepción a la regla de dependencias está justificada en el plan de 001.
- El nombre del juego y su pantalla de entrada son los de siempre; aquí solo la cuenta.
- Las reglas de firestore/authentication del proyecto de Rafa son de su cuenta personal.
- Todo en español (Constitución IV).
