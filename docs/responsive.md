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
- **Student:** contenido centrado de hasta 1044 px, conforme al requisito del prototipo. Las columnas de inicio y módulos
  dependen del ancho disponible después del sidebar mediante container queries. El catálogo
  distribuye tarjetas automáticamente; el destacado conserva las medidas de sus recursos Figma
  y omite la ilustración en móvil. Por solicitud del 22 de octubre, el sidebar se alinea con Admin:
  232 px desde 1200 px y 76 px en tablet, pegado al borde, altura de viewport y scroll propio;
  opciones compactas de 44 px, iconos alineados y ayuda/cuenta al pie. El contenido conserva su
  máximo de 1044 px y la navegación móvil mantiene los cinco destinos. Practicar apila panel y guía,
  Perfil usa campos adaptables y la navegación móvil permite los cinco destinos. Ver
  [inspección y diferencias del prototipo](student-design-audit.md).
- **Admin:** rediseño `286:50`, sidebar de 232 px desde 1200 px y de 76 px entre 600 y 1199 px,
  con altura de viewport, scroll propio y logout al final. Móvil usa navegación horizontal y menú
  accesible; perfil conserva vuelta/tema. El área principal usa 32 px de padding y móvil 20 px
  (16 px bajo 360). Las tablas mantienen los mismos tracks para cabecera/filas; bajo 620 px de
  contenido pasan a identidad/estado/acción. Filtros se apilan bajo 520 px de contenido. Perfil
  combina identidad de 320/224 px y configuración, apiladas cuando el contenido baja de 600 px.
  Formularios modales de 600 px, foto de 560 y visor de 720, siempre limitados al ancho y `100dvh`
  con scroll interno. Las acciones y títulos se adaptan sin escalar la interfaz.
- **Cuenta y mensajes del router:** contenedor fluido, cabecera y navegación envolventes,
  títulos ajustables y controles accesibles con los tokens existentes.

Los espacios externos habituales oscilan entre 16 y 24 px. Texto largo puede envolver;
campos y botones mantienen tamaños utilizables. No se oculta overflow vertical ni se escala
la aplicación entera para aparentar que cabe. En pantallas muy bajas, con teclado visible,
zoom, errores o páginas largas hay desplazamiento vertical natural y todas las acciones
siguen siendo alcanzables. Las vistas no dependen de una orientación fija.

## Alcance y comprobación

Los ajustes responsive cambian presentación y distribución. La primera fase añade StudentGuard,
cinco destinos y configuración demo según [phase-one-prototype.md](phase-one-prototype.md).
Se mantienen autenticación, contratos, validaciones y persistencia de usuarios. Admin retira sus demos
al adoptar el rediseño y muestra las dependencias reales pendientes; Student conserva su configuración demo.
Sin dependencias, endpoints, migraciones ni escrituras en producción.

La revisión local en Chrome usa Vite y API con PostgreSQL WASM aislado, autenticación real,
capturas y medidas de documento/controles. Incluye escritorio, tablet, móvil, paisaje y
viewports CSS reducidos equivalentes al espacio disponible con zoom o teclado. Esta emulación
no sustituye una prueba de teclado físico ni una matriz completa de navegadores.
Resultados ejecutados y limitaciones en [verification.md](verification.md).
