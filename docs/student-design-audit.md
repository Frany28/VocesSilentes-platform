# Comparación de Student con Figma

Referencia: [Student, 175:22520](https://www.figma.com/design/GRbHCgOXNZZxRWSpIcHKVU/VocesSilentes-Website?node-id=175-22520&m=dev).
Inspección del 9 de octubre de 2026 mediante el plugin, `figma-design-to-code` y `figma-use`.

Actualización solicitada por el usuario el 22 de octubre: el sidebar implementado sigue ahora
la alineación de Admin (232/76 px, controles de 44 px y tipografía compacta), con ayuda/cuenta
al pie. Esto reemplaza sus medidas originales 240/80 px descritas en la inspección histórica;
no se atribuye a una nueva exportación Figma. Se conservan marca, recursos, temas y navegación móvil.

## Evidencia y límites del acceso

El árbol contiene 120 frames: 30 de Inicio, 36 de Mis módulos y 54 de Practicar/instrucciones.
Se obtuvo contexto detallado y captura de los 30 de Inicio, los 36 de Mis módulos y 14 de
Practicar. El plan Education alcanzó su límite de llamadas: otras 40 variantes de práctica
solo se pudieron consultar en el árbol de capas y quedan pendientes de verificación visual.
No se afirma haber inspeccionado su contexto detallado. Mi progreso y Mi perfil no tienen
frames propios en las cinco páginas del archivo; su composición académica reutiliza los
componentes inspeccionados y queda pendiente de una referencia visual propia.

Auto Layout inspeccionado: filas desktop/tablet con gap y padding 24, contenido vertical
FILL/HUG, cabecera horizontal con gap 16, bienvenida vertical con gap 8 y columnas de inicio
que se apilan en tablet/móvil. Sidebar 240/80 px; móvil con navegación inferior. Manrope,
tokens claro/oscuro, radios 12/16/24 px y sombras Action/Soft coinciden con el sistema existente.
Se leyeron propiedades de instancias Sidebar, Navigation/Item, ThemeToggle, Welcome,
ModuleCard, ProgressSummary, CameraPanel y Practice/Guide. El árbol contiene 824 reacciones
en instancias; ese conteo no equivale a haber ejecutado los flujos del prototipo en Figma.

## Matriz previa a implementar

| Pantalla / referencia                                        | Estado inicial                      | Diferencias o interacciones faltantes                                            | Reutilización                                                      |
| ------------------------------------------------------------ | ----------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Inicio (`181:50`, `181:317`, `181:494` y temas/estados)      | Parcial                             | Datos solo DEV; contenedor ampliado a 1280; accesos educativos pendientes        | StudentHome, StudentHero, LearningAside, ModuleCard, LessonPreview |
| Mis módulos (`193:4639`, `193:4890`, `193:5096` y variantes) | Parcial                             | Datos solo DEV; navegación de tarjetas pendiente; estados de búsqueda existentes | StudentModules, ModuleFilters, ProgressSummary, StudentNote        |
| Practicar (`206:6604`, `206:6792`)                           | Faltante                            | Página, panel, guía, instrucciones y estados visuales                            | Layout Student, Button, Badge, Icon, gradiente y notas existentes  |
| Mi progreso                                                  | Faltante; referencia propia ausente | Navegación y demostración de avance por módulo                                   | ProgressSummary, ModuleCard, progreso derivado de lecciones demo   |
| Mi perfil                                                    | Faltante; referencia propia ausente | Página de identidad de sesión, disponibilidad de edición                         | Input, Badge, sesión existente, superficies Student                |
| Layout y navegación                                          | Parcial                             | ADMIN podía entrar; tres enlaces pendientes; progreso omitido en móvil           | AuthGuard, NavigationItem, sidebar, tema, logout                   |

Ninguna pantalla principal estaba completa funcionalmente para la entrega desplegada:
Inicio y Mis módulos ya tenían presentación y estados, pero faltaba demo configurable
en producción y completar navegación. Sus componentes se conservan.

## Práctica con contexto detallado disponible

- Cámara apagada: Claro desktop `206:6604`, tablet `206:6792`.
- Permiso pendiente: Claro desktop `207:7304`, Oscuro desktop `207:7775`.
- Lista para practicar: Claro móvil `207:8576`.
- Analizando: Claro tablet `207:9386`, Oscuro tablet `207:9854`.
- Seña reconocida: Oscuro tablet `207:10797`.
- Volver a intentar: Claro tablet `207:11272`, Oscuro desktop `207:11575`.
- Permiso denegado: Oscuro tablet `207:12711`.
- Cámara no disponible: Claro tablet `207:13190`.
- Instrucciones: Claro desktop `209:11792`, Oscuro desktop `209:11870`.

Las restantes combinaciones de estos estados/tamaños/temas requieren comparación visual futura;
se adaptan con los componentes, geometría y tokens verificados, sin afirmar equivalencia exacta.

## Diferencias intencionales

Los SVG nuevos se descargaron sin alterar desde el contexto de los 14 frames de práctica.
Para combinaciones sin contexto disponible se reutilizan iconos originales del UI Kit:
éxito claro (check 20 px), denegación clara (lock 32 px), cámara no disponible oscura (info 20 px)
y cámara lista oscura (camera 48 px). Esas variantes quedan pendientes de cotejo específico;
no se dibujan recursos ni se afirma que sus tamaños sean los de los frames no inspeccionados.

- El usuario exige máximo 1044 px. Los frames desktop consultados usan contenido de 1128 px;
  se conserva el máximo solicitado y se distribuyen las columnas dentro de él.
- Sidebar sticky de altura de viewport, crecimiento natural de páginas y padding fluido de
  16–24 px conservan la adaptación solicitada antes de esta tarea; Figma usa frames largos.
- La navegación móvil añade Progreso para que los cinco destinos académicos sean alcanzables;
  la referencia contiene cuatro. Conserva los mismos controles y pasa a cinco columnas.
- Banners y selectores de demostración permanecen visibles también en el build habilitado.
  La práctica representa estados elegidos manualmente, sin cámara ni reconocimiento LSV,
  y adapta los textos que de otro modo prometerían una integración inexistente.
- Perfil muestra datos de sesión como solo lectura. No incorpora un formulario que prometa
  guardar cambios sin endpoint. Progreso usa exclusivamente la colección demo identificada.

La validación final y el alcance funcional se registran en [phase-one-prototype.md](phase-one-prototype.md)
y [verification.md](verification.md). Sin modificaciones del archivo Figma.

## Matriz después de implementar

| Pantalla    | Resultado funcional                                                            | Verificación visual de diseño                                      |
| ----------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Inicio      | Conservado; demo configurable y accesos a práctica                             | 30 variantes con contexto; máximo 1044 intencional                 |
| Mis módulos | Conservado; búsqueda/filtros/estados y tarjetas navegables                     | 36 variantes con contexto                                          |
| Practicar   | Panel, guía, instrucciones y ocho estados manuales; demo explícita             | 14 variantes con contexto; otras 40 pendientes de cotejo detallado |
| Mi progreso | Resumen y tarjetas derivados de la colección demo común, con carga/vacío/error | Sin frame propio: composición reutilizada, pendiente de referencia |
| Mi perfil   | Datos reales de sesión, rol y correo pendiente; edición no disponible          | Sin frame propio: controles reutilizados, pendiente de referencia  |
| Layout      | Solo USER; cinco enlaces móviles/desktop, tema y logout existente              | Componentes inspeccionados; quinto enlace móvil intencional        |
