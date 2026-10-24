# Comparación de Student con Figma

Revisión directa del 22 de octubre de 2026 mediante las habilidades figma-design-to-code y figma-use:
[Student, 175:22520](https://www.figma.com/design/GRbHCgOXNZZxRWSpIcHKVU/VocesSilentes-Website?node-id=175-22520)
y [estándar compartido, 412:27892](https://www.figma.com/design/GRbHCgOXNZZxRWSpIcHKVU/VocesSilentes-Website?node-id=412-27892).
No se modificó el archivo Figma. Se conservó el trabajo existente del sidebar y la evidencia real.

## Inventario y diferencias

El árbol actual contiene **202 frames**: Inicio 30, módulos 36, práctica/instrucciones 54,
perfil/foto/seguridad 52 y reporte 30. Se consultaron directamente nombres, tamaños y textos de
todas las variantes, más contexto detallado y capturas de las composiciones y estados utilizados.
El conteo del árbol no equivale a 202 comparaciones visuales individuales. La revisión en navegador
y sus límites se registran en [verification.md](verification.md).

| Área      | Ya coincidía                                                               | Diseño anterior reemplazado / resultado                                                                                                                               |
| --------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inicio    | Bienvenida, hero, módulos, lección sugerida, resumen y notas               | Cabecera con acción de tema de 44 px; sidebar 240/80, radio 24 y navegación común; contenido de 1128 px                                                               |
| Módulos   | Colección demo explícita, filtros, búsqueda, tarjetas ilustradas y estados | Campos compactos, botones por densidad y navegación actualizada; sin perder búsqueda ni bloqueo de módulos                                                            |
| Lecciones | Fila de siguiente lección existente                                        | La página Student no contiene una pantalla propia de lección; el acceso existente lleva a práctica demo. Faltan contenido/vídeo y servicio educativo                  |
| Práctica  | Panel, ocho estados manuales, guía y textos honestos de demostración       | Iconos originales de éxito claro, permiso denegado claro y cámara no disponible oscura; badges y acciones; foco/scroll compartidos del diálogo                        |
| Progreso  | Avance derivado de la colección demo y estados de lectura                  | Adopta layout/navegación/controles comunes. No hay un frame propio de Progreso en la página suministrada                                                              |
| Perfil    | Identidad real y correo verificado de la sesión                            | Sustituye la tarjeta de solo lectura antigua por identidad, tabs, datos personales y seguridad de Figma, compartidos con Admin                                        |
| Foto      | Admin ya tenía selector y encuadre locales                                 | Un único selector/diálogo para ambos roles: selección, error, zoom 100–135 %, cancelación y liberación de URL; guardado y borrado deshabilitados por dependencia real |
| Reporte   | Backend, CSRF, idempotencia, validación confiable y Storage privado reales | Reemplaza formulario anterior por título/tipo/ubicación/descripción, orientación, selección/preview/eliminación de evidencia y confirmación con referencia real       |

## Fuentes visuales y componentes

Inicio: 181:50, 181:317, 181:494. Catálogo: 193:4639. Práctica: 206:6604 y los
paneles 207:10157, 207:12063, 207:8740 y 207:13505. Instrucciones: 209:11844.
Perfil: 300:11971, 300:12120, 300:12683, 300:13217, 300:13994 y 300:15266.
Foto: 300:12574/12591/12625/12657. Reporte: 328:14046/14183/14457/14598/14694/15210
y 329:14716. Navegación: 75:281. Botones compactos: 286:82. Estándar: 412:27892.

Button e Input admiten density compact/comfortable; Select, IconAction, ThemeAction, Dialog,
Avatar y NavigationItem viven en components/ui. El layout de perfil, campos, seguridad y fotos
viven en features/account; Admin conserva su hook de edición autorizada. Se retiraron los antiguos
componentes equivalentes de Admin después de sustituir y comprobar sus imports. Las fuentes,
logos y SVG originales se reutilizan; los recursos descargados no contienen paths redibujados.

## Adaptación y diferencias deliberadas

- Aprendizaje usa padding/gap 24, contenido máximo 1128 y sidebar 240/80; cuenta y reporte
  usan sidebar al borde y contenido centrado de 904. Reporte de tablet se limita a 560.
  Esto sustituye el máximo anterior de 1044 y el ajuste manual 232/76 por la referencia actual solicitada.
- La navegación móvil conserva cinco destinos, incluido Progreso; el frame muestra cuatro.
  El sidebar mantiene Reportar un error y Cerrar sesión al final; Admin solo revisa reportes.
- Los avisos y selectores demo siguen visibles. No se ocultan para aparentar datos educativos reales.
- Perfil USER conserva campos de solo lectura y guardar deshabilitado. Seguridad no recoge contraseñas
  para un endpoint inexistente. Foto solo previsualiza en el dispositivo; no utiliza report-evidence.
- Título y ubicación del reporte se envían como texto dentro de description, limitado en conjunto
  a 4000 caracteres. Se mantienen las categorías reales TECHNICAL/CONTENT/OTHER. No hay migración
  ni nuevos campos/API inventados. Validación y confirmaciones reflejan el resultado real del servicio.

Pendientes funcionales: edición propia USER, cambio de contraseña y gestión de sesiones, persistencia
de foto de perfil, contenido/lecciones/vídeos, progreso y reconocimiento LSV. Pendientes de referencia:
pantallas propias de lección y progreso. Estos estados no se presentan como operaciones exitosas.
