# Inicio de sesión — Auth de Figma

Referencia consultada el **9 de octubre de 2026**:
[Auth, 135:18693](https://www.figma.com/design/GRbHCgOXNZZxRWSpIcHKVU/VocesSilentes-Website?node-id=135-18693&m=dev).
Se inspeccionaron los descendientes de la página, contexto de alta fidelidad, capturas,
variantes de Field/Password y keyframes originales mediante la integración de Figma.
La primera cuenta conectada no tenía acceso; la segunda permitió completar la lectura.
No se modificó el archivo de Figma.

## Composición y archivos

Las rutas públicas `/login` y `/register` quedan fuera del layout técnico para conservar la composición de Auth.
`features/auth/login/` separa página, presentación del formulario, marca, ilustración,
panel visual, validación local y mensajes públicos. El envío sigue en `use-auth-form.js`.
`AuthLayout` comparte la página y `AuthForm` la tarjeta, mensajes y acciones; los campos de login
siguen en `LoginForm`. Registro adapta esta presentación a sus cinco campos: [contrato y flujo](registration.md).

La composición usa Tailwind 4 en JSX: layout, breakpoints, tamaños, espaciado, tipografía,
colores semánticos, bordes, sombras de tarjeta/etiquetas y estados accesibles de enlaces.
`LoginLink` comparte el estilo de navegación de Auth. `tokens.css` expone `muted`, `info`,
`accent` y `tertiary` como aliases Tailwind de los colores existentes, sin nuevos valores.
Las utilidades de tipografía referencian los contratos `--type-*` del sistema visual.
Los overrides `!` de Button, Alert y ThemeToggle son puntuales porque el UI Kit conserva
sus reglas CSS sin capa; una utilidad normal no tiene precedencia sobre ellas.

El CSS específico conserva tokens/gradientes y sus capas animadas, recortes de PNG de marca,
keyframes originales y ajustes internos de controles compartidos. Se eliminaron los antiguos
archivos `login-layout.css`, `login-form.css`, `login-responsive.css`, `login-visual.css` y
`login-preview.css`; `login-surfaces.css` reúne las superficies y el ancho original del título de alerta.
No se duplican reglas de composición entre CSS y Tailwind ni se añade una dependencia.

| Referencia            | Claro    | Oscuro   | Implementación                                      |
| --------------------- | -------- | -------- | --------------------------------------------------- |
| Escritorio 1440 × 960 | 147:6348 | 147:6351 | Formulario 480 px; panel de 600 px                  |
| Tablet 834 × 1100     | 147:6349 | 147:6352 | Formulario centrado y franja de bienvenida          |
| Móvil 390 × 920       | 147:6350 | 147:6353 | Formulario de ancho disponible con padding de 24 px |

Se usan breakpoints de 1200 y 600 px para interpolar las tres composiciones; son decisiones
de implementación entre las referencias, no medidas adicionales atribuidas a Figma.
La altura mínima crece a 1160/1300/1120 px en los errores, como sus variantes,
y puede crecer más por contenido o zoom. No se fija la altura de campos ni mensajes.

Los componentes generales se reutilizan: Input y PasswordInput añaden `appearance="plain"`,
Button mantiene sus estados con altura de 48 px en login, Alert conserva los roles y recursos,
ThemeToggle admite los atributos de ThemeSwitch e Icon admite el Chevron de 16 px.
La apariencia predeterminada del UI Kit sigue disponible.

Los colores base y las fuentes locales siguen siendo los del sistema visual.
`login-tokens.css` incorpora exclusivamente gradientes/sombra y recursos originales de Auth.
`assets/auth/` contiene dos PNG originales de marca y dieciséis SVG originales:
Eye/EyeOff normal/disabled en ambos temas, Play, Chevron y dos órbitas por tema.
Los PNG conservan los recortes especificados por Figma; no se usan capturas como recursos.
Eye claro tiene raíz de 24 px y aparece en un slot de 20 px; Eye oscuro tiene raíz de 20 px,
como en la composición original;
se ajusta su representación, sin editar atributos ni paths del SVG.

## Autenticación y estados

- Inicial, campos vacíos y correo inválido: errores locales por campo, texto original de Figma,
  `aria-invalid`, descripciones asociadas, anuncio y foco en el primer campo incorrecto.
- Credenciales: 401 INVALID_CREDENTIALS muestra el mensaje genérico de Figma,
  sin información sobre existencia o estado del correo.
- Conexión: NETWORK_ERROR muestra «Sin conexión» y permite reintentar explícitamente.
- Carga: campos, visibilidad y envío deshabilitados, anuncio de estado y protección síncrona
  contra múltiples submit, incluido Enter.
- 429 RATE_LIMITED: mensaje genérico de límite y espera cuando Retry-After puede leerse.
  No existe el bloqueo de cuenta de 12 horas del prototipo ni reenvío automático.
- CSRF_INVALID obtiene protección nueva en el siguiente envío explícito; 503, JSON ilegible
  y otros errores muestran un mensaje controlado de servicio, sin mensajes internos.

La validación local refleja correo ASCII/normalización/254 caracteres y login de 1–128 puntos
de código/512 bytes. No aplica el mínimo de registro al login ni recorta la contraseña.
Los valores solo viven en los inputs y FormData temporal; la contraseña se limpia al confirmar éxito.
AbortSignal cancela al salir. Corregir un campo revalida sus errores y limpia el aviso de servidor,
conservando la espera de 429 mientras esté activa.

Se mantienen `requestJson`, credentials:include, CSRF en memoria, cookies HttpOnly y AuthProvider.
`ApiError.retryAfter` es opcional y contiene segundos normalizados del header, nunca una credencial.
USER entra a `/student` y ADMIN a `/admin`; `/account` es válido para ambos y el retorno a
`/admin` solo se respeta para ADMIN. URLs, queries, traversal y rutas no publicadas se descartan.
Los permisos reales siguen en backend.

## Diferencias y límites

- El móvil de Figma omite el selector de tema. Se conserva un control compacto de 44 × 44 px
  en la cabecera para poder cambiar de tema con ratón, tacto o teclado sin ampliar su altura.
- El panel de lección es una vista previa estática con nombre accesible que lo indica, sin enlace
  ni botón que simule contenido funcional. Registro e inicio apuntan a rutas publicadas.
  No se añaden OAuth, recuperación, correo ni módulos educativos.
- Los keyframes de los gradientes, órbitas, emblema y etiquetas flotantes conservan el ciclo de 8 s.
  La entrada de la tarjeta se ejecuta una sola vez para evitar ocultar el formulario periódicamente.
  `prefers-reduced-motion` elimina animaciones y transiciones en login y controles.
- El exportador expresa el grosor animado de las órbitas como border-width sobre un recurso SVG.
  Ese valor no cambia el trazo interno del SVG usado como fondo; se conserva el grosor del recurso
  original, con su movimiento de escala y opacidad. No se promete identidad animada píxel por píxel.
  `.login-orbit` usa border-style: none para que Preflight de Tailwind no dibuje contornos cuadrados
  al animar border-width; las órbitas circulares siguen procediendo de los SVG originales.
- La rasterización tipográfica de Windows/Chromium difiere de Figma aunque se conservan
  familia, peso, tamaño, interlineado, dimensiones y recursos originales.
- CORS actual no expone Retry-After para peticiones entre orígenes. En ese caso el navegador
  no permite leer la espera exacta y se muestra el aviso genérico con reintento explícito;
  la API sigue imponiendo sus cuotas. Mismo origen permite la cuenta atrás.
  No se altera backend ni CORS para resolverlo en esta tarea.

Las descripciones de componentes proporcionan tiempos de foco, botones y enlaces;
MCP no exporta los flujos Smart Animate del prototipo como keyframes de esas interacciones:

> Prototype interactions aren't currently supported in MCP. Keyframes on the canvas are visible, but not the smart animate interactions between frames or their transition settings. Code generated from this selection will represent the start and end states, not the transition between them.

## Verificación

Pruebas frontend controlan fetch: no representan una autenticación con Supabase ni usuarios reales.
Cubren validación, Enter, contraseña, CSRF/cookies, mensajes genéricos, reintento, 429,
concurrencia, cancelación, actualización del proveedor y destinos autorizados por rol.
El contrato de persistencia se comprueba con la integración SQL aislada existente.

Capturas locales en Brave/Chromium de ambos temas a 1440, 834 y 390 px, contrastadas con
las referencias principales y variantes de error/carga. También se inspeccionaron 320 px,
texto largo, recursos locales y reducción de movimiento. Evidencia ignorada por Git:
`.local/login-*.png`, `login-geometry.json`, `login-states.json` y `login-assets.json`.
Los dobles usados exclusivamente para las capturas de estados se identifican en la evidencia.
Resultados de controles locales y límites en [verification.md](verification.md).
