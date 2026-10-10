# Sistema visual y componentes generales

Referencia consultada el **9 de octubre de 2026**: [VocesSilentes / UI Kit, nodo 75:67](https://www.figma.com/design/GRbHCgOXNZZxRWSpIcHKVU/VocesSilentes-Website?node-id=75-67&m=dev).
Es un frame de 1776 × 5380 con component sets originales, variables Theme Claro/Oscuro,
estilos tipográficos y ocho componentes de iconografía. Se consultaron los hijos de la respuesta
inicial incompleta, capturas, variables y propiedades originales mediante la integración de Figma.

Code Connect no permite leer conexiones con el plan educativo actual: requiere un asiento Dev/Full
en Organization/Enterprise. No se afirma ausencia de mappings; la tabla siguiente es correspondencia
manual documentada. No se modificó el archivo Figma ni se instalaron dependencias nuevas.

## Correspondencia y contratos

La composición Auth y sus extensiones de controles están documentadas en [login.md](login.md).
Input/PasswordInput admiten `appearance="plain"` para Field/Input y Field/Password,
con Eye/EyeOff originales, y ThemeToggle propaga atributos de ThemeSwitch. Icon admite también
el slot Chevron de 16 px. Las variantes predeterminadas del UI Kit conservan su geometría.

Implementación en `Frontend/src/components/ui/`, con imports locales explícitos `.jsx`.
Los controles admiten eventos, atributos HTML y `ref` de React 19 mediante props. En Input y
PasswordInput el ref apunta al input; en selecciones, al input nativo; en los demás, al elemento raíz.
`className` aplica al elemento raíz visual, que es el contenedor del campo y el label de selección.
No hay peticiones HTTP ni permisos de negocio en estos componentes.

| Figma / node ID                                     | Código                               | Props y variantes                                                                                                                                                 |
| --------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button/Primario `75:97`, Button/Secundario `75:124` | `Button.jsx`                         | `variant="primary"` (predeterminado) / `secondary`; `children`, `icon` (Arrow por defecto, null lo omite), `disabled`, `loading`, `loadingLabel`, `type="button"` |
| Input `75:177`                                      | `Input.jsx`                          | `label`, `help`, `error`, `icon`, `endControl`, `id`; atributos nativos value/defaultValue, required, name, type, autoComplete, disabled y aria-describedby       |
| Input, extensión funcional                          | `PasswordInput.jsx`                  | Props de Input; type controlado internamente, visibilidad local y botón Mostrar/Ocultar; autoComplete lo decide el formulario                                     |
| Checkbox `75:206`                                   | `Checkbox.jsx`                       | `children` como label; checked/defaultChecked, onChange, name, value, disabled, required y atributos nativos                                                      |
| Radio `75:235`                                      | `Radio.jsx`                          | Mismo contrato de selección; `name` agrupa opciones y conserva flechas nativas                                                                                    |
| ThemeToggle `75:254`                                | `ThemeSwitch.jsx`, `ThemeToggle.jsx` | ThemeSwitch: `dark`, `onClick`, atributos de button; ThemeToggle conecta con useTheme y la persistencia existente                                                 |
| Navigation/Item `75:281`                            | `NavigationItem.jsx`                 | `href`, `active`, `icon` (Book por defecto), `children`, atributos de enlace; active establece aria-current="page"                                                |
| Badge `75:308`                                      | `Badge.jsx`                          | `tone="info" / "success" / "warning" / "error"`, `children`                                                                                                       |
| Alert `75:335`                                      | `Alert.jsx`                          | Mismos tones, `title`, `children`; error usa role=alert, otros status; role puede ajustarse para mensajes estáticos                                               |
| Progress `75:366`                                   | `Progress.jsx`                       | `value` (0–100), `label`, `valueText`; inicio 0, progreso 60 y completo 100 en la referencia; completo cambia a success                                           |
| Iconografía `79:54`                                 | `Icon.jsx`                           | `name`, `size=24` por defecto; variantes de 20 px y `tone` enumeradas abajo; iconos decorativos aria-hidden                                                       |

Button implementa normal, hover, presión, foco, disabled y loading; Input vacío, valor, foco,
error y disabled. Checkbox/Radio implementan selección, foco y disabled. La preferencia elegida
en ThemeSwitch es independiente del tema visual del contenedor, como en las cuatro variantes Figma.
No hay tamaños adicionales, spinner ni animaciones de carga especificados. Loading muestra texto,
elimina el icono y deshabilita realmente el botón; el consumidor debe activar loading al iniciar
su operación. No sustituye la protección de concurrencia del formulario o servicio.

ModuleCard `75:425` queda fuera del alcance general por ser un componente de módulo. Tampoco se
implementaron esos flujos en la extracción inicial del UI Kit. El entorno administrativo posterior
reutiliza estos componentes; véase [admin.md](admin.md). Auth conserva
sus formularios y lógica originales; solo ThemeToggle adopta la presentación del diseño.

## Tokens

`styles/tokens.css` contiene ambos temas y mantiene page/content/surface/border/focus, vinculados
a Tailwind 4 mediante @theme inline. `foundations.css` centraliza tipografías, medidas, radios,
espaciado y elevaciones. `[data-theme="light|dark"]` permite temas locales además de la raíz;
los componentes heredan variables y comparten un único markup para ambos temas.

### Estándar de radios

Los radios se eligen por función del elemento y se reutilizan en todos los temas y estados.
`foundations.css` es la fuente de los tokens del UI Kit:

| Uso                                                                                | Token           | Radio  |
| ---------------------------------------------------------------------------------- | --------------- | ------ |
| Marca de checkbox                                                                  | `--radius-sm`   | 4 px   |
| Controles pequeños, como el botón interno de mostrar contraseña                    | `--radius-md`   | 8 px   |
| Campos de texto, correo y contraseña; elementos de navegación y selección          | `--radius-lg`   | 12 px  |
| Botones principales, superficies del UI Kit, alertas y tarjetas interiores de Auth | `--radius-xl`   | 16 px  |
| Badges, selector de tema y elementos circulares                                    | `--radius-full` | 999 px |

Las tarjetas y paneles principales de Auth usan 24 px (`rounded-3xl`) según la composición existente.
El radio del contorno de **todos los inputs es 12 px**, tanto en la variante predeterminada como
en `appearance="plain"`; PasswordInput lo hereda de `.vs-input-shell`, sin una excepción por tipo.
Foco, error, deshabilitado y mostrar/ocultar contraseña no cambian ese radio.
El botón interno de visibilidad conserva su radio de 8 px para su propio indicador de foco.

| Token CSS / variable Figma          | Claro             | Oscuro            |
| ----------------------------------- | ----------------- | ----------------- |
| page / bg/primary                   | #faf9fe           | #171625           |
| surface / bg/surface                | #ffffff           | #252338           |
| content / text/primary              | #332e4a           | #f3f0fc           |
| text-secondary                      | #5d5870           | #c8c3d7           |
| action-primary                      | #6045c5           | #b7a4ff           |
| action-text                         | #ffffff           | #21183f           |
| action-hover                        | #5036ad           | #c9b9ff           |
| action-pressed                      | #40288e           | #d9cdff           |
| action-disabled                     | #e7e2f0           | #403b57           |
| text-disabled / action/textDisabled | #827b94           | #aaa3be           |
| focus / focus/ring                  | #6045c5           | #b7a4ff           |
| surface-accent                      | #e9dfff           | #38304f           |
| surface-neutral                     | #f3f4f6           | #2a2a36           |
| border-subtle                       | #dadce5           | #454552           |
| status-info / surface-secondary     | #286b86 / #eaf4f6 | #8abfcb / #20373c |
| status-success / status-success-bg  | #26734d / #eaf6ee | #75d9a4 / #20372d |
| status-warning / surface-tertiary   | #956200 / #fff5d6 | #ffd162 / #3d3420 |
| status-error / status-error-bg      | #bc3d50 / #fceef1 | #ff94a4 / #3d252d |

Tipografía: Manrope 600 16/24 para botones, navegación y títulos de alerta; Manrope 400 14/22
para labels de campo y contenido secundario; Manrope 400 12/18 para ayudas; Inter 400 16/24
para entradas. Letter spacing 0. La galería usa Manrope 700 36/44, 600 24/32 y 500 18/28.
Espaciado utilizado: 0, 4, 8, 12, 16, 24 y 32 px. Radios: 4, 8, 12, 16 y 999 px.
Sombras originales: Action 0 3 8 rgba(94,69,196,.18), hover 0 8 16 -3 rgba(48,26,102,.20),
Soft 0 6 16 rgba(38,26,77,.10); Input Focus 0 0 8 2 al 20% del focus por tema.
No hay gradientes en los componentes generales consultados.

Geometría nominal: Button 208 × 52, Input 304 × 132 (control 272 × 48), Checkbox/Radio
260 × 52 (marca 22 × 22), ThemeSwitch 224 × 52, NavigationItem 264 × 52, Badge 200 × 40,
Alert 350 × 104 y Progress 304 × 114 (track 272 × 12). Son anchos con max-width:100% y
alturas mínimas o de contenido, no alturas rígidas para textos variables.

## Recursos locales originales

`src/assets/fonts/` incluye archivos variables Manrope e Inter y sus licencias SIL OFL.
Se descargaron las familias especificadas, sin sustitución, del repositorio oficial de
[Manrope](https://github.com/google/fonts/tree/main/ofl/manrope) e
[Inter](https://github.com/google/fonts/tree/main/ofl/inter). Figma no expone el binario ni su revisión;
la identidad exacta de esa revisión no puede verificarse. Inter desactiva optical sizing para
respetar el texto de 16 px sin introducir ajustes ópticos del navegador.

`src/assets/icons/` contiene 36 SVG originales descargados de las URLs de get_design_context.
No se editaron paths, dimensiones raíz ni colores. Los nombres hash de exportación se conservan;
`styles/icons.css` les asigna nombres semánticos y selecciona el recurso por tema. Icon usa la
imagen como recurso decorativo a tamaño nativo, sin escalarla ni usar capturas como fondos.

| Slot de 20 px / tone                    | SVG claro | SVG oscuro |
| --------------------------------------- | --------- | ---------- |
| arrow / primary                         | e442e.svg | b3785.svg  |
| arrow / secondary                       | 087ae.svg | 797ee.svg  |
| arrow / disabled (automático en Button) | f4874.svg | 1d1e4.svg  |
| mail / default                          | 10be6.svg | 844db.svg  |
| mail / error                            | d7fe3.svg | 91fca.svg  |
| mail / disabled                         | 1fc77.svg | 303b9.svg  |
| sun / default                           | db174.svg | e9682.svg  |
| moon / default                          | c349c.svg | 41100.svg  |
| book / default                          | c6aec.svg | ba9d3.svg  |
| book / active                           | 90966.svg | 17bb2.svg  |
| info / info                             | c2a26.svg | f0ebb.svg  |
| info / warning                          | 5041b.svg | 8135e.svg  |
| info / error                            | 88c0b.svg | c781c.svg  |
| check / success                         | f378a.svg | 9e0e5.svg  |

Iconografía de 24 px del frame claro: arrow=e3048.svg, mail=b94f9.svg, book=05eb8.svg,
check=d37a7.svg, lock=69b09.svg, info=4ddb1.svg, sun=43030.svg, moon=35b32.svg.
No se inventó una variante oscura de ese frame; los slots de componentes sí tienen recursos por tema.
No aparecen fotografías ni logotipos en el inventario general.

## Accesibilidad, adaptación y diferencias documentadas

- Labels usan htmlFor/id; useId evita colisiones. Input combina aria-describedby externo con ayuda
  o error, y usa aria-invalid cuando hay error. No valida reglas de negocio automáticamente.
- Inputs y selecciones son nativos; mantienen formularios, gestores de contraseñas, teclado,
  name/value, disabled y fieldset disabled. Mostrar/Ocultar es type=button y no envía el formulario.
- Figma no tiene PasswordInput ni icono de visibilidad. La extensión mínima usa texto Mostrar/Ocultar,
  tokens existentes, aria-controls, aria-pressed y foco visible; está separada de los especímenes Figma.
- Focus de Button/Secundario es visualmente igual a Default en Figma. Se añadió contorno de 3 px
  para foco de teclado; aparece también en la muestra Focus de la galería. ThemeSwitch y el control
  Mostrar/Ocultar reciben foco mínimo porque no se especifica en Figma.
- Input tiene padding declarado 16 px pero un marco fijo de 132 px: sus hijos dejan 12 px reales
  debajo de la ayuda. Se conserva esa geometría observada con padding inferior 12, permitiendo crecer
  con texto largo. Progress conserva track 272 px, incluidos los 2 px que exceden el área interna
  calculada al descontar el borde, dentro del padding visual del componente.
- No hay breakpoints de componentes en Figma. Se mantienen anchos nominales con max-width:100%,
  flujo normal y texto envolvente. La superficie animada de Button es la única capa absoluta;
  selección usa un input oculto visualmente que permanece accesible.
- Button reproduce elevación de 2 px en 180 ms, presión de 4 × 2 px en 100 ms y retorno 180 ms,
  ease-in-out. prefers-reduced-motion elimina transiciones. No se añadieron otros movimientos.
- Los roles de Alert distinguen urgencia; Badge contiene texto además del color; Progress anuncia
  porcentaje y descripción. Los ajustes de forced-colors mantienen límites y foco visibles.

Pendientes de especificación: visibilidad de contraseña, foco propio de ThemeSwitch, foco distinguible
del botón secundario, iconografía de 24 px en tema oscuro, estados combinados error+disabled,
checked+disabled y active+focus; el navegador combina los estados funcionales de forma accesible.
No se presentan estas extensiones como variantes originales de Figma.

## Uso

Tailwind 4 está integrado mediante Vite y `global.css`. `@theme inline` en `tokens.css`
vincula colores existentes con utilidades: `text-content`, `text-muted`, `text-info`,
`bg-surface`, `bg-accent`, `bg-tertiary`, `border-border` y `outline-focus`.
Las áreas combinan utilidades en JSX y CSS de geometría fluida para la
[adaptación al ancho y la altura](responsive.md), usando `--type-*` para la tipografía;
los controles del UI Kit conservan su implementación compartida.
Gradientes animados, keyframes originales y recortes de marca permanecen en CSS específico.

```jsx
import { Button } from './components/ui/Button.jsx';
import { Input } from './components/ui/Input.jsx';
import { Icon } from './components/ui/Icon.jsx';
import { PasswordInput } from './components/ui/PasswordInput.jsx';

<Button type="submit" loading={pending} loadingLabel="Procesando…">Entrar</Button>
<Input label="Correo" name="email" type="email" autoComplete="email"
  icon={<Icon name="mail" size={20} />} help="Usaremos este correo para tu cuenta."
  error={emailError} required />
<PasswordInput label="Contraseña" name="password" autoComplete="current-password" required />
```

## Galería y verificación

Ejecutar `pnpm dev:frontend` y abrir `/ui.html` en el puerto de Vite. Es una entrada HTML
independiente con carga condicionada por import.meta.env.DEV; no forma parte del router de la app
ni del build de producción (que solo construye index.html). No requiere API, sesión ni PostgreSQL.
En esta revisión se usó <http://localhost:5180/ui.html> con FRONTEND_PORT temporal, sin cambiar .env.

La galería presenta diez familias en el orden y contenido de Figma, todos los estados y ambos temas.
Clases vs-preview-* fijan hover/pressed/focus para comparar, sin ser props públicas ni cambiar
disabled/loading por estados decorativos. Las muestras adicionales prueban texto corto/largo,
errores y PasswordInput. ThemeSwitch cambia su preferencia de muestra sin guardar el tema global.
El reflow de la galería bajo 1776 px y sus paddings bajo 600 px son decisiones del entorno de
revisión, no breakpoints atribuidos a Figma.

Se compararon capturas de los diez component sets a sus dimensiones originales con Brave/Chromium,
viewport 1776 px, escala 1, fuentes y SVG cargados, y ambos temas. Se corrigieron diferencias de
cascada, altura de Input y track de Progress. Geometría nominal comprobada para todas las variantes.
Se conservan diferencias de rasterización tipográfica entre Figma y Windows/Chromium y el foco
accesible añadido al botón secundario; no se afirma identidad píxel por píxel. Se revisó ancho 375 px
sin desbordamientos de controles ni documento. Evidencia local ignorada por Git: `.local/figma-*.png`,
`.local/gallery-*.png`, `.local/ui-geometry.json` y `.local/ui-mobile.json`.

Pruebas: `src/test/ui-controls.test.jsx`, `ui-fields.test.jsx`, `ui-feedback.test.jsx` cubren
teclado, selección, disabled/loading, referencias, visibilidad de contraseña, conservación del
valor y autocomplete, errores asociados, roles y progreso. Controles agregados: `pnpm verify`.
Resultados y límites de la entrega en [verification.md](verification.md).
