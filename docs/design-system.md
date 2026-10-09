# Sistema visual y temas

No se recibió URL ni archivo Figma. No se han extraído colores, tipografías, medidas, iconos ni
componentes de marca. La pantalla actual es un comprobante técnico, no una implementación del diseño.

## Base actual

`src/styles/tokens.css` define variables semánticas page, content, surface, border y focus usando
colores del sistema del navegador (Canvas, CanvasText, ButtonFace, ButtonBorder y Highlight).
`color-scheme` alterna light/dark en la raíz. Son valores provisionales accesibles al sistema, no
valores atribuidos a Figma. La tipografía y las medidas conservan valores nativos del navegador.

Tailwind 4 se integra mediante @tailwindcss/vite y `@import 'tailwindcss'` siguiendo la
[integración oficial](https://tailwindcss.com/docs/installation/using-vite). `@theme inline` vincula
las utilidades bg-page/text-content/etc. a las variables; el selector de dark usa data-theme.

ThemeProvider recupera preferencia guardada, después preferencia del sistema, y permite alternarla
con ThemeToggle. La preferencia se guarda en localStorage si está disponible; almacenamiento bloqueado
no impide cambiar de tema. `aria-pressed` comunica el estado y se mantiene foco nativo visible.
No se pide cámara ni se realizan peticiones al servidor desde estos componentes.

## Trasladar el diseño cuando exista referencia

1. Obtener acceso al archivo Figma y nodos de referencia; registrar enlace y revisión consultados.
2. Inventariar variables y estilos existentes; extraer ambos temas, tipografías, espaciado y estados.
3. Mapear los nombres semánticos del diseño a CSS; añadir variables específicas si son necesarias.
4. Reutilizar componentes existentes y separar UI de estado/servicios. No duplicar por pantalla.
5. Implementar variantes y estados: foco, hover, disabled, loading y error según el componente real.
6. Validar correspondencia visual, contraste, teclado, lectores y ambos temas con la referencia.

Pendiente de extraer: paleta por tema, familias/pesos tipográficos y licencias, tamaños/line-height,
espaciado, breakpoints, radios, bordes, sombras, iconografía y estados. No sustituir huecos con una
paleta inventada ni presentar valores provisionales como tokens aprobados.
Los recursos locales aprobados irán en src/assets/ cuando existan; no hay carpetas vacías de assets.
