# Microinteracciones y transiciones

Trabajo del 27 de octubre de 2026. Amplía el sistema existente por solicitud del usuario;
las convenciones nuevas de movimiento son decisiones de implementación, no tokens extraídos de Figma.
Se mantienen colores, tipografías, tamaños, distribución, contratos y operaciones existentes.

## Auditoría previa

| Elemento / archivos relativos a `Frontend/src/`                                                      | Hallazgo inicial                                                                                                                                                                                                  | Criterio aplicado                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `styles/button.css`, `density.css`; `components/ui/Button.jsx`                                       | Cómodo: hover −2 px/180 ms y presión 100 ms. Compacto anula transform y transiciones. Loading reemplaza contenido y puede alterar ancho automático; hover secundario no excluye disabled en todos los selectores. | Compartir respuesta de superficie, conservar dimensiones con contenido de reposo reservado y excluir estados no disponibles.                              |
| `styles/icon-action.css`, `navigation.css`, `application-navigation.css`; sidebars de ambos roles    | Estados de fondo/foco presentes, cambios inmediatos. Algunas reglas de hover de sidebar se aplican también a botones deshabilitados.                                                                              | Transiciones compartidas y hover solo con puntero fino; hit targets y selección permanecen estables.                                                      |
| `styles/input.css`, `select.css`, `selection.css`, `theme-switch.css`; `auth/login/login-motion.css` | Solo Input plain transiciona box-shadow, definido desde Auth. Select, selección y tema cambian inmediatamente.                                                                                                    | Trasladar movimiento al ámbito compartido; mantener foco inmediato y medidas constantes.                                                                  |
| `features/auth/login/LoginLink.jsx`, `features/account/styles/account-profile.css`                   | Auth tiene opacidad 180 ms con duración literal; tabs carecen de transición.                                                                                                                                      | Usar los mismos tokens, sin alterar rutas ni estados seleccionados.                                                                                       |
| `styles/dialog.css`, `components/ui/Dialog.jsx`, `hooks/use-dialog.js`; instrucciones de práctica    | Diálogos nativos, foco/Escape/scroll coordinados; apertura y desmontaje inmediatos.                                                                                                                               | Entrada CSS única de opacidad y 4 px; backdrop progresivo. Cierre inmediato para conservar callbacks y foco, sin recrear ciclo de vida.                   |
| `styles/feedback.css`; tarjetas Student y Admin                                                      | Alertas/progreso estáticos; las tarjetas de módulo contienen botones pero su superficie no es clicable; métricas son informativas.                                                                                | Feedback discreto de entrada; progreso determinado sin temporizadores. Animar únicamente superficies que ya son botones/enlaces, como la fila de lección. |

## Estándar

Tokens de movimiento compartidos, curva `ease-in-out` existente: presión 100 ms, controles 180 ms,
superficies 220 ms y diálogos 240 ms. Hover de Button eleva únicamente su superficie 2 px;
active vuelve al reposo. IconAction mantiene su objetivo de 44 px y responde en fondo/icono.
Navegación y tabs transicionan color, fondo y sombra sin mover su contenido.

Focus-visible aparece inmediatamente, con el contorno o alternativa ya presentes. Solo se suavizan
sombras/fondos asociados; el foco no depende de la animación. Los botones disabled/loading no se elevan
ni responden visualmente al hover. Las reglas de hover se limitan a `(hover: hover) and (pointer: fine)`;
teclado y pantallas táctiles conservan foco, selección y respuesta active.

No se usa `transition: all`, ni listeners de movimiento, RAF continuo, scroll animado, bibliotecas
nuevas o animación de contenedores informativos. `prefers-reduced-motion` suprime transiciones y
entradas, conservando estados finales y controles funcionales. Las animaciones ilustradas de Auth
ya existentes conservan su implementación y su opción de movimiento reducido.

## Implementación y comprobaciones

| Archivos relativos a `Frontend/src/`                                                                       | Cambio                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `styles/foundations.css`                                                                                   | Tokens compartidos y valores de movimiento reducido. Sin cambios a tokens de color, tipografía o geometría.                                                                                                                                                                                                                                        |
| `styles/button.css`, `button-hover.css`, `button-loading.css`, `density.css`; `components/ui/Button.jsx`   | Hover/elevación compartidos por densidad; presión conserva sus colores y geometría visual existentes, sin animar inset. El orden de imports permite que active prevalezca sin duplicar reglas. Reposo sin sombra de compacto conservado. Loading mantiene el contenido original oculto y superpone su etiqueta, sin modificar el contrato público. |
| `styles/motion-controls.css`, `icon-action.css`, `navigation.css`, `selection.css`, `theme-switch.css`     | Transiciones acotadas de controles; presión discreta del icono con objetivo estable; check/radio transicionan opacidad; indicador de tema usa transform entre sus posiciones originales. Foco inmediato, incluidos controles cuyo anillo usa box-shadow.                                                                                           |
| `styles/motion-surfaces.css`; `features/auth/login/LoginLink.jsx`                                          | Duraciones de enlaces/tabs centralizadas; sombra solo en la fila de lección que ya es un botón. Entrada breve de Alert sin desplazar contenido. No se anima el valor de progreso ni se simula carga.                                                                                                                                               |
| `styles/motion-overlays.css`                                                                               | Entrada única para Dialog, ConfirmationDialog, menús modales, fotos, visor e instrucciones de práctica; backdrop comparte duración. No se modifica JavaScript de diálogos, foco o confirmaciones.                                                                                                                                                  |
| `features/auth/login/login-motion.css`                                                                     | Retira la transición global de campos definida desde Auth; ahora pertenece al ámbito de controles compartidos. Ilustraciones y keyframes originales conservados.                                                                                                                                                                                   |
| `features/admin/styles/admin-controls.css`, `admin-navigation.css`; `features/student/student-sidebar.css` | Hover condicionado a puntero fino y controles habilitados, conservando las variantes y colores de cada área.                                                                                                                                                                                                                                       |
| `styles/ui.css`                                                                                            | Importa las hojas compartidas dentro de la capa existente de componentes.                                                                                                                                                                                                                                                                          |
| `test/button-loading.test.jsx`                                                                             | Comprueba conservación del contenido/icono, ocultación accesible del reposo, nombre de carga y retorno al estado habilitado. La geometría se mide en Chrome.                                                                                                                                                                                       |

`docs/design-system.md` registra tokens y convenciones actuales; `docs/development.md` explica su
mantenimiento y los límites de jsdom. Esta documentación es el registro de auditoría, archivos y resultados.
No se añadieron dependencias, endpoints, modelos ni excepciones al objetivo de tamaño de archivos.

## Verificación

| Control                             | Resultado                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm verify`                       | Código 0: lint sin errores ni advertencias, formato, 122 pruebas frontend + 44 backend + 65 SQL/auth = 231 pruebas aprobadas; Prisma y build correctos. Build frontend repetido con el orden final de estilos; formato comprobado tras cerrar este registro.                                                                                                                              |
| Geometría antes/después             | 54 combinaciones (9 rutas × 3 anchos × 2 temas): `/login`, `/register`, `/ui.html`, `/admin/users`, `/admin/users/new`, `/admin/profile`, `/student`, `/student/profile`, `/student/reports/new`. Se compararon ancho/alto, fuentes y radios de Button, IconAction, navegación, campos, selecciones, tema, tabs y modal. Igualdad de medidas y sin overflow horizontal a 1440/834/390 px. |
| Estados en Chrome                   | Primario, secundario y destructivo en claro/oscuro: superficie −2 px en hover, retorno a 0 en active, tamaño del botón estable y ausencia de movimiento/transición al deshabilitar. Hover de compacto usa la sombra existente.                                                                                                                                                            |
| Carga en Chrome                     | Creación de usuario con transporte pausado explícitamente para inspección visual: mismo ancho/alto, sin elevación y etiqueta completa «Creando usuario…» dentro del botón. Rechazo controlado devuelve el estado de error recuperable. Es una prueba de UI, no una alta real.                                                                                                             |
| Movimiento reducido                 | Chrome emula reduce: Dialog sin animación, duración de Button y navegación a cero y hover sin desplazamiento. El foco inicial y su restauración se conservan en ambos modos.                                                                                                                                                                                                              |
| Puntero táctil                      | Emulación móvil de Chrome con coarse/hover:none y movimiento normal: no aplica elevación hover. No sustituye una prueba en dispositivo físico.                                                                                                                                                                                                                                            |
| Confirmaciones y teclado            | Revisión adicional: 16 combinaciones de logout (ADMIN/USER × 1440/834/390/320 × claro/oscuro), Tab/Shift+Tab, Escape, foco inicial/restaurado y scroll. Ocho cierres confirmados revocan sesión SQL; cancelar la conserva. Descarte de perfil/reporte conserva borrador al cancelar. Cero excepciones.                                                                                    |
| `pnpm academic:verify`              | Código 0: cinco usuarios, edición/borrado lógico, cinco reportes con imagen, visor, resolución/reapertura, lectura/práctica manual y 24 eventos; 40 combinaciones responsive/tema sin overflow ni cámara, cero excepciones. Express y PostgreSQL WASM efímeros reales, almacenamiento de imágenes con sustituto local explícito de S3.                                                    |
| GitHub Actions, Supabase/S3 remotos | No ejecutados ni acreditados por estas pruebas locales. No se ejecutaron migraciones en una base externa.                                                                                                                                                                                                                                                                                 |

Las pruebas frontend usan jsdom/transporte controlado. Los flujos de sesión y la revisión académica
usan backend/cookies/CSRF reales exclusivamente sobre PostgreSQL WASM efímero. La inspección de loading
pausa una petición en el navegador de pruebas y suprime el clic de las mediciones de presión para no
ejecutar acciones de negocio durante la inspección. No se presentan esas mediciones como integraciones.

Evidencia local ignorada por Git: `.local/motion-geometry-review.mjs`, `.local/motion-states-review.mjs`,
`.local/motion-review/{before,after,states}.json`, capturas de hover/disabled/carga;
`.local/component-audit-review/` y `.local/module-ii-review/` para las regresiones de flujos.
El controlador de medición se ajustó para ignorar la carga permanente de la galería, no serializar
nodos React, esperar al desmontaje de modales y evitar clics de cancelación durante la medición de active.

## Límites y decisiones

- No hay una decisión visual pendiente que bloquee esta implementación. Se eligió cierre inmediato
  de los modales porque su ciclo de vida actual desmonta la vista en el callback; animar la salida
  exigiría cambiar ese contrato y demorar foco/navegación. El usuario no necesita esperar a la entrada.
- Los desplegables nativos de Select conservan el comportamiento del sistema; se anima el control,
  no se reemplaza su popup ni se crea un dropdown propio.
- No se añade movimiento a tarjetas informativas, esqueletos, cámara o valores educativos. El progreso
  continúa reflejando únicamente los datos recibidos, sin animaciones de carga ficticias.
- Verificación visual en Chromium local y emulación táctil/reduced-motion; no es una matriz de
  navegadores, prueba de lector de pantalla físico ni benchmark de FPS. No se afirma paridad de píxeles
  con Figma. Los efectos nuevos se ejecutan por interacción/entrada, sin ciclos ni listeners continuos.
