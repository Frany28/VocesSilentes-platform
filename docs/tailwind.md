# Tailwind CSS

Tailwind CSS 4.3.3 se compila con `@tailwindcss/vite`, ya instalado y fijado en el único
lockfile del workspace. La integración sigue la [guía oficial de Vite](https://tailwindcss.com/docs/installation/using-vite).
No necesita CDN, un segundo pipeline PostCSS ni un `tailwind.config.js` de Tailwind 3.

## Entrada, detección y cascada

`Frontend/src/styles/global.css` es la entrada de la aplicación y de la galería. Usa
`source(none)` y declara las fuentes de clases explícitamente: `app`, `components`, `features`,
`dev`, `index.html` y `ui.html`. Backend, documentación, fixtures y scripts locales no generan CSS.
Las clases deben aparecer completas en el código; para variantes, usar cadenas completas en
condicionales o mapas. Evitar construir utilidades como `bg-${color}`.

El orden es siempre `theme, base, components, utilities`:

- `theme`: fuentes, fundamentos y variables de ambos temas.
- `base`: Preflight y compatibilidad existente de elementos nativos de las vistas técnicas.
- `components`: controles compartidos y CSS específico de cada funcionalidad.
- `utilities`: utilidades generadas desde el código; prevalecen sobre los componentes.

Cada hoja importada directamente desde JavaScript declara ese orden antes de importar o definir
reglas. Esto es necesario porque una funcionalidad puede cargarse antes que `global.css`; la primera
aparición de una capa fija su prioridad. Importar hojas hijas con `layer(components)` y colocar
las reglas propias dentro de `@layer components`. No añadir reglas globales sin capa.

No mezclar una utilidad fija con una regla CSS que deba modificar la misma propiedad según el ancho,
la altura o un estado. Por ejemplo, si CSS controla el padding fluido de una tarjeta, omitir `p-6`
en ese elemento. Conservar cada propiedad en un único lugar evita depender de la especificidad.
Los `!important` anteriores de Auth y Student se retiraron al corregir esta precedencia.

## Tokens y temas

`foundations.css` conserva tipografías, medidas, radios y sombras existentes; `tokens.css` conserva
los colores de `[data-theme="light|dark"]`. `tailwind-theme.css` expone sus alias mediante
[`@theme inline`](https://tailwindcss.com/docs/theme#referencing-other-variables), para resolver
las variables en el elemento que las usa, incluidos los temas locales de la galería.
No duplicar valores de Figma ni sustituirlos por colores predeterminados de Tailwind.

| Utilidades de ejemplo                                         | Origen existente                    |
| ------------------------------------------------------------- | ----------------------------------- |
| `bg-page`, `bg-surface`, `text-content`, `text-muted`         | Superficies y texto por tema        |
| `bg-secondary`, `bg-neutral`, `bg-accent`, `bg-tertiary`      | Superficies semánticas              |
| `text-error`, `text-success`, `text-warning`, `text-info`     | Estados semánticos                  |
| `bg-action`, `text-action-text`, `disabled:text-disabled`     | Acciones y estados deshabilitados   |
| `border-border`, `outline-focus`, `aria-invalid:border-error` | Contornos y foco                    |
| `font-brand`, `font-field`                                    | Manrope e Inter locales             |
| `rounded-field`, `rounded-control`, `rounded-card`            | Radios existentes de 12, 16 y 24 px |
| `shadow-card`                                                 | `--shadow-soft`                     |

La variante `dark:` sigue `[data-theme="dark"]`, igual que ThemeProvider; no usa una segunda
preferencia de tema. Los colores semánticos cambian automáticamente y normalmente no requieren
duplicar clases con `dark:`. Los radios históricos `rounded-sm/md/lg/xl/2xl` resuelven las variables
homónimas existentes del proyecto: no asumir las medidas predeterminadas de Tailwind.
Los breakpoints aprobados siguen en las hojas de geometría o como variantes exactas (`min-[600px]`,
`max-[360px]`). No sustituirlos por `sm:` o `md:`, cuyos valores predeterminados son diferentes.

## Criterio de implementación

Usar utilidades en JSX para composición simple, espaciado, color, dimensiones y estados locales.
Reutilizar Button, Input, Alert y Badge; `className` permite ajustes como `w-full` o `max-w-80`.
Las props `density`, `appearance`, `variant` y `tone` conservan sus contratos y estados compartidos.
No añadir `clsx`, `tailwind-merge` o un sistema de variantes mientras no exista una necesidad real;
al combinar clases, no proporcionar utilidades contradictorias para la misma propiedad.

CSS específico sigue siendo adecuado para pseudo-elementos, iconos originales, recortes de marca,
animaciones, tipografía compuesta `--type-*`, geometría fluida, container queries y estados coordinados
de los controles. No convertir ese CSS íntegramente a `@apply`: trasladaría los selectores sin
simplificar sus responsabilidades. Cuenta y reportes ya usan utilidades para los estilos locales
migrados; sus reglas sustituidas se eliminaron.

## Verificación

Ejecutar `pnpm verify`. Vitest/jsdom comprueba comportamiento y accesibilidad, pero no calcula
layout real. Los cambios de cascada también requieren revisión en navegador de temas, estados,
diálogos, anchos y alturas; comparar con el estado previo y comprobar desbordamientos.
La ejecución local de esta integración se registra en [verification.md](verification.md).
