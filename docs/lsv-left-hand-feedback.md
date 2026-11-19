# Lateralidad y retroalimentación educativa — 18 de noviembre de 2026

Base: `cc18e25` de main, con PR #4 y la renovación del frontend integrados.
Rama de trabajo: `fix/left-hand-student-feedback`. No se entrenó ni publicó otro modelo.

## Auditoría de datos reales

Inventarios inspeccionados por separado; el piloto reutiliza recortes de los videos y **no deben
sumarse** como participantes o ejecuciones nuevas. Las etiquetas Left/Right son observaciones del
detector: todavía falta contrastarlas anatómicamente en las grabaciones originales.

| Clase           | Prototipos demo Right | Piloto Right | Candidatas Right con geometría válida | Candidatas Left con geometría válida |
| --------------- | --------------------: | -----------: | ------------------------------------: | -----------------------------------: |
| A               |                     2 |            2 |                                     4 |                                    0 |
| E               |                     2 |            2 |                                     2 |                                    0 |
| I               |                     2 |            2 |                                     3 |                                    0 |
| O               |                     1 |            1 |                                     2 |                                    0 |
| U               |                     1 |            1 |                                     2 |                                    0 |
| NONE            |                     1 |            1 |                                     5 |                                    1 |
| Otras 22 letras |                     0 |            0 |                                     0 |                                    0 |

`candidate-observations.json`: 31 ventanas, 24 con geometría válida (23 Right y una Left).
Cinco de las 24 siguen sin etiqueta. Las otras siete ventanas están rechazadas y no contienen
secuencias entrenables. La candidata Left es NONE: no constituye una letra ni tiene revisión LSV.
`prepared-samples.json` y `training-ready.json` contienen cero muestras.

El piloto contiene nueve secuencias Right, sin participante o revisión aprobada en sus registros.
Se conserva la declaración de consentimiento educativo ya dada por la propietaria, documentada en
[el registro de consentimiento](lsv-owner-consent-2026-11-18.json). No se vuelve a solicitar ni se
convierte esa declaración en aprobación lingüística o en identidades inventadas.

**Cero muestras elegibles para el entrenamiento revisado y cero personas independientes verificadas.**
Las 27 letras requieren todavía datos izquierdos revisados: A, B, C, D, E, F, G, H, I, J, K, L, M,
N, Ñ, O, P, Q, R, S, T, U, V, W, X, Y, Z; también NONE. Ambos lados necesitan evaluación independiente.
Las 27 fichas ilustradas son referencias educativas, no grabaciones ni prototipos de cámara.

Reproducir desde la raíz:

```powershell
node Backend/scripts/audit-lsv-handedness.js
pnpm lsv:readiness datos-entrenamiento/preparado/training-ready.json --json
```

La primera orden imprime conteos por clase/mano, elegibilidad y SHA-256 de cada inventario, sin puntos
ni códigos personales. Informa archivos ausentes como ausentes. No suma colecciones superpuestas.
`independentParticipants: null` no afirma independencia; la demo no es un lote para reentrenamiento.

## Procesamiento y problemas encontrados

- `createHandEngine` entrega el video original a Hand Landmarker. El espejo pertenece al CSS de
  video/canvas; no se refleja la entrada ni se intercambian categorías. Se conservan etiqueta cruda,
  confianza, track y correcciones del estabilizador. No se encontró un intercambio Left/Right.
- `sequenceFeatures` corrige relación de aspecto, traslación y escala de palma. Conserva orientación,
  profundidad y trayectoria, con 16 frames y 66 características. Su matemática trata ambos lados
  simétricamente y mantiene compatibilidad con la demo. No se rota ni refleja para forzar coincidencias.
- DTW filtra por mano observada y usa prototipos separados. Sin prototipos Left devuelve
  `UNSUPPORTED_HAND`; cambiar esta abstención por una predicción derecha inventaría cobertura.
- El defecto educativo era mostrar falta de entrenamiento y presentar una coincidencia experimental
  como «¡Muy bien!»/«Paso logrado», con avance automático. Se elimina esa atribución en estudiantes.
  El laboratorio conserva hipótesis, lateralidad, tiempo, abstenciones y límites del modelo.

Se consultó la [documentación oficial de Hand Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker?tab=Web)
el 18 de noviembre: devuelve puntos y handedness, no valida LSV. No se interpretó la orientación de
una vista espejada como evidencia anatómica ni lingüística. No se incorporó material de otras lenguas.

## Ayuda educativa y evidencia

`practiceOutcome` distingue referencia, incertidumbre y evidencia de captura. CANDIDATE, BACKGROUND,
AMBIGUOUS, OUT_OF_DISTRIBUTION y UNSUPPORTED_HAND no confirman un error ni un acierto, incluso si
la etiqueta coincide con el objetivo. No se muestran candidata, entrenamiento o prototipos al alumno.
Los textos de acierto/error confirmado quedan reservados en `practiceMessages`, **sin habilitarse**:
no existe hoy una fuente competente que confirme un intento de cámara. Un campo arbitrario `confirmed`
o un modelo importado no habilita esos mensajes. No se añadió un mecanismo de calificación.

`captureFeedback` solo usa observaciones temporales validadas, sin modificar DTW o los datos:

- Todas las observaciones sin manos: «No podemos ver tu mano. Colócala dentro del encuadre».
- Tres observaciones estables con una punta junto/fuera del borde (margen 0,01): pedir que todos los
  dedos estén visibles. No afirma que un dedo esté oculto ni deduce su posición a partir de una abstención.
- Desplazamiento RMS XY de los 21 puntos >2 alturas de imagen/s durante 200 ms, mismo track y pasos
  de 40–200 ms: pedir realizar la seña más despacio para observarla. Es ayuda visual heurística, no
  una velocidad lingüísticamente incorrecta. Se corta la medición ante pérdidas/cambios de track.
- Falta de evidencia o captura interrumpida: mensaje de incertidumbre; no inventar correcciones
  sobre dedos, orientación, trayectoria, iluminación o rapidez.

Estas heurísticas de ayuda requieren calibración con personas reales. No rechazan muestras de
entrenamiento ni sustituyen la revisión de movimientos J/Ñ/Z. La orientación y trayectoria LSV se
conservan; su cobertura y revisión siguen pendientes.

Se mantiene «Repetir intento». «Ver referencia» lleva el foco al encabezado de la referencia y
funciona con teclado. «Continuar práctica» es navegación voluntaria, disponible sin exigir una
coincidencia. Ninguna predicción experimental avanza sola. Se conservan cámara opcional, procesamiento
local, cierre de pistas/tareas, progreso académico y autenticación existentes.

## Capturar ejemplos izquierdos auténticos

Seguir [el procedimiento y mínimos del entrenamiento](lsv-alphabet-training.md). En el laboratorio:

1. Usar el mismo código seudónimo por persona, asignarla a una sola partición y registrar consentimiento
   y procedencia. El consentimiento declarado existente se mantiene; documentar los alcances por toma.
2. Seleccionar la letra o NONE y «Mano que se solicita capturar → Izquierda · ejecución real».
   El detector sigue siendo automático. Esta selección no refleja puntos ni cambia sus etiquetas.
3. Capturar la ejecución original completa. Si la mano observada no coincide, el guardado queda
   deshabilitado; repetir y revisar la fuente. El contrato también rechaza importaciones contradictorias.
4. Guardar/exportar puntos localmente; siguen `REAL`, con mano observada/solicitada y revisión pendiente.
   Registrar aprobación competente, variante y movimiento antes de usarla para entrenar. Para NONE,
   revisar explícitamente qué letras excluye; una B fuera del piloto de vocales no es un negativo de B.
5. Reunir ambas manos y diversidad de personas/cámaras en train, validation y test, sin mover personas
   entre grupos. Un reflejo o varias sesiones de la misma persona no cuentan como personas nuevas.

No se obtuvieron grabaciones nuevas durante esta tarea. Falta una campaña real de captura y revisión,
por lo que no se presentan accuracy, precision, recall o F1 nuevos.

## Verificación

- Backend completo: **106/106** pruebas aprobadas, incluidas las nuevas regresiones de normalización
  bilateral y SHA-256 de la demo. No son métricas de reconocimiento LSV.
- Regresión frontend final de reconocimiento/captura/vídeo/vocales: **52/52**, en 14 archivos.
  Lint final: cero errores y una advertencia previa de tamaño en `Backend/tests/auth/login.test.js`.
- Frontend completo con dos workers: **277/286** aprobadas. Persisten nueve fallos previos sobre
  espacios de contraseñas en account-settings, admin-validation, auth-forms (dos), login-fields,
  login-submit, login-validation, registration-validation y ui-fields. Sin cambios en esos módulos.
  Una primera ejecución simultánea con compilación/lint tuvo cuatro fallos adicionales de tiempo
  en video-lab-flow y vowel-module; ambos archivos pasan aislados y en la repetición completa.
- Build frontend/backend y validación Prisma correctos. `pnpm verify` se detiene en el formato
  preexistente de `Backend/tests/auth/admin-password-reset.test.js`; se ejecutaron pruebas, build
  y validación de esquema por separado. No se ejecutaron migraciones o comprobación de PostgreSQL real.
- Chrome con bundle productivo, MediaPipe real y cámara de reproducción original/reflejada:
  captura automática, incertidumbre sin diagnósticos técnicos, foco de «Ver referencia», ausencia de
  avance automático y **cero escrituras académicas**. Comprobadas ocho vistas por recorrido
  (320/390/834/1440 px, claro/oscuro), sin desbordamiento ni rótulos espejados. A coincidente conserva
  la incertidumbre y solo avanza voluntariamente. El replay reflejado no es una muestra izquierda real.
- Evidencias privadas locales: `.local/left-hand-*.log` y `.local/lsv-demo-review/`.
  No hubo cámara física, evaluación lingüística independiente, GitHub Actions o despliegue.
