# Adaptación al ancho y la altura

La solicitud del usuario amplía la adaptación de las composiciones existentes: deben aprovechar
la altura disponible, además de cambiar con el ancho. Las medidas fluidas son decisiones de
implementación para ese objetivo; no se atribuyen como nuevas medidas extraídas de Figma.
Se conservan colores, fuentes, radios, recursos, tema y componentes compartidos.

## Comportamiento por área

- **Login y Registro:** página con altura mínima de viewport pequeño (`100svh`) y crecimiento
  por contenido. Padding, espacios y títulos fluidos, sin alturas artificiales por errores.
  En pantallas bajas se omiten badges y promociones decorativas. Los campos, acciones,
  mensajes y enlaces siguen presentes. Registro agrupa cuatro campos en dos filas desde
  600 px; contraseña ocupa una fila completa. Móvil conserva una columna.
- **Student:** contenido centrado de hasta 1280 px. Las columnas de inicio y módulos
  dependen del ancho disponible después del sidebar mediante container queries. El catálogo
  distribuye tarjetas automáticamente; el destacado reduce tipografía e ilustración y omite
  esta última cuando el texto necesita el espacio. Sidebar sticky con scroll propio.
- **Admin:** contenido fluido sin altura mínima fija, sidebar con altura de viewport y scroll
  propio. Listas pasan de tabla a tarjetas según el ancho del contenido, filtros usan auto-fit
  y campos agrupados se apilan según el ancho del formulario. Acciones y cabecera pueden
  envolverse. Diálogos limitados al viewport dinámico (`100dvh`) con scroll interno.
- **Cuenta y mensajes del router:** contenedor fluido, cabecera y navegación envolventes,
  títulos ajustables y controles accesibles con los tokens existentes.

Los espacios externos habituales oscilan entre 16 y 24 px. Texto largo puede envolver;
campos y botones mantienen tamaños utilizables. No se oculta overflow vertical ni se escala
la aplicación entera para aparentar que cabe. En pantallas muy bajas, con teclado visible,
zoom, errores o páginas largas hay desplazamiento vertical natural y todas las acciones
siguen siendo alcanzables. Las vistas no dependen de una orientación fija.

## Alcance y comprobación

Cambios de presentación y distribución únicamente. Se mantienen autenticación, permisos,
contratos y validaciones, persistencia de usuarios y avisos de demostración existentes.
Sin dependencias, endpoints, migraciones ni escrituras en producción.

La revisión local en Chrome usa Vite y API con PostgreSQL WASM aislado, autenticación real,
capturas y medidas de documento/controles. Incluye escritorio, tablet, móvil, paisaje y
viewports CSS reducidos equivalentes al espacio disponible con zoom o teclado. Esta emulación
no sustituye una prueba de teclado físico ni una matriz completa de navegadores.
Resultados ejecutados y limitaciones en [verification.md](verification.md).
