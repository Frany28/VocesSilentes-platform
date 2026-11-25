# Pruebas y métricas del reconocimiento

Resultados locales del 24 de noviembre de 2026 (Windows, Node 22, rama `codex/adaptive-lesson-layout`).

## 1. Qué prueban las pruebas automatizadas

Las pruebas usan geometría **sintética** (generador cinemático `Backend/tests/fixtures/synthetic-hand.js`,
que transcribe las fichas del curso) y los 8 prototipos reales de vocales del modelo demo. Verifican
lógica, invariancias y temporalidad. **No miden precisión con personas reales.**

| Archivo | Cobertura |
| --- | --- |
| `Backend/tests/lsv-engine.test.js` | Especificación completa y bloqueos; invariancia de escala y traslación; lateralidad (izquierda reflejada = derecha); efecto espejo con etiqueta errónea; 22 letras estáticas × 2 manos × 25 variaciones (escala, posición, rotaciones, compresión de profundidad, ruido); letras parecidas que no se aprueban entre sí; ambigüedad E/S; gestos desconocidos; correcciones concretas; prototipos reales; transiciones; J/Ñ/Z con movimiento completo, incompleto, ausente y con otra configuración; reconocedor en vivo (estabilidad, fotograma aislado, mensajes estables, mano ausente, parcial, dos manos, pérdida breve, `UNRECOGNIZED`, mano izquierda); selección de mano activa; evidencia híbrida |
| `Backend/tests/lsv-engine-evaluation.test.js` | Predicción de conjunto abierto, matriz de confusión, desglose por mano, verificación (rechazos y aceptaciones falsas), latencia y CLI |
| `Frontend/src/test/letter-recognition.test.jsx` | Etapas de la interfaz con evidencia (mano izquierda, veto, rival, movimiento, letras en revisión), guía en vivo, consonantes sin modelo DTW, hook con paquetes reales del motor, letras sin comprobación |
| Pruebas existentes de cámara, intentos y vocales | Regresión de la experiencia de las lecciones |

Ejecutar:

```powershell
node --test Backend/tests/lsv-*.test.js
pnpm --filter @vocessilentes/frontend exec vitest run src/test/letter-recognition.test.jsx
```

## 2. Resultados reales

| Control | Resultado |
| --- | --- |
| Suite backend completa | **130/130** correctas (106 previas a la entrega anterior + 24 nuevas) |
| Pruebas LSV del backend | 81/81 (57 existentes + 24 nuevas) |
| Suite frontend completa | **350 correctas, 16 fallidas** de 366 |
| Línea base frontend antes del cambio | 340 correctas, 17 fallidas de 357 (las mismas 16 + `auto-capture`, intermitente) |
| Fallos frontend persistentes | 9 de espacios en contraseñas (autenticación) y 7 de laboratorio/cámara (`alphabet-lab-capture`, `local-videos`, `selected-hand-attempt`, `video-lab-flow` ×2, `video-lab-validation` ×2). Fallan igual en la línea base y aislados; no se modificaron |
| Lint de los archivos modificados | 0 errores (advertencias de longitud de archivo, como en el resto del repositorio) |
| Prettier de los archivos modificados | Correcto |
| `vite build` | Correcto |

### Comprobación con datos reales disponibles

Los 8 prototipos reales de vocales (dos videos, mano derecha) y sus reflejos como mano izquierda:

| Vocal | Derecha | Izquierda (reflejo) | Modelo DTW anterior con la izquierda |
| --- | --- | --- | --- |
| A (×2) | MATCH | MATCH | `UNSUPPORTED_HAND` |
| E (×2) | MATCH (S como rival cercana) | MATCH | `UNSUPPORTED_HAND` |
| I (×2) | MATCH | MATCH | `UNSUPPORTED_HAND` |
| O | MATCH | MATCH | `UNSUPPORTED_HAND` |
| U | MATCH | MATCH | `UNSUPPORTED_HAND` |

Limitación: los umbrales se contrastaron con estos mismos prototipos, y el modelo DTW anterior los
contiene como prototipos propios (su acierto en derecha es trivial). **No es una comparación
independiente** ni una exactitud. La muestra NONE se reconoce como B: es una mano plana con el pulgar
plegado y la auditoría anterior ya advertía que el NONE del piloto de vocales puede contener consonantes.

### Latencia del motor

Medida en Node sobre 300 fotogramas sintéticos por letra, Ryzen 5 7535HS:

| Letra | Mediana | p95 |
| --- | --- | --- |
| L (estática) | 0,08 ms | 0,17 ms |
| V (corrección activa) | 0,11 ms | 0,28 ms |
| J (movimiento) | 0,10 ms | 0,28 ms |
| Z (movimiento) | 0,09 ms | 0,17 ms |

No incluye MediaPipe. En móviles se espera un coste varias veces mayor, todavía muy inferior al del
detector; debe medirse en dispositivos reales.

## 3. Métricas pendientes de datos reales

**No medidas:** exactitud balanceada, matriz de confusión, precisión/recall/F1 por letra y por mano,
tasa de falsos positivos, tasa de rechazos incorrectos y comparación anterior/nueva con personas. El
objetivo inicial de **95 % de exactitud balanceada en condiciones controladas** no se ha alcanzado ni
puede afirmarse.

Cuando existan lotes revisados (ver [LSV_DATASET_STRATEGY.md](LSV_DATASET_STRATEGY.md)):

```powershell
pnpm lsv:engine:evaluate .local/lote-test.json --partition test --output .local/evaluacion-motor.json
```

El informe incluye: matriz de confusión y métricas por letra (`openSet`, con `UNSURE` contado como error),
desglose por mano (`byHand`), tasa de rechazos incorrectos y de aceptaciones falsas frente a las letras
parecidas (`verification`), latencia por fotograma y las predicciones por ejecución. Para comparar con el
DTW, usar las mismas muestras de test con `pnpm lsv:train` (que ya exporta `evaluation.json`) y no elegir
umbrales mirando *test*.

## 4. Verificación manual pendiente

- Persona real diestra y zurda frente a la cámara: confirmar que la lateralidad mostrada coincide con
  la mano física y recorrer las 24 letras evaluables.
- Móvil de gama media: fluidez del visor y latencia total.
- Lector de pantalla: los cambios de estado se anuncian en la región `role="status"` existente.
