# Estrategia de datos para el abecedario LSV

Amplía el protocolo de captura vigente en [lsv-alphabet-training.md](lsv-alphabet-training.md). Este
documento no autoriza capturas: cada sesión requiere consentimiento explícito y registro privado.

## 1. Disponibilidad de datasets

| Recurso | Procedencia | Licencia | Letras | Manos | Uso posible |
| --- | --- | --- | --- | --- | --- |
| Dataset público de LSV | No encontrado | — | — | — | — |
| 9 muestras provisionales locales | Dos videos de vocales | Consentimiento educativo declarado; sin participantes ni revisión por muestra | A, E, I, O, U, NONE | Solo derecha | Comprobación de coherencia, no evaluación |
| Fichas del curso | Manual Fuentes 2022 | Uso educativo declarado | 27 | Ilustración derecha | Referencia; MediaPipe no detecta manos en los dibujos |
| FEVENSOR 1999, videos de terceros | Varios | Copyright o sin licencia | — | — | No se descargan ni reutilizan |
| Datasets de otras lenguas (ASL, BdSL47, LSA64…) | Varios | Diversas | No LSV | — | Solo referencia técnica; nunca como clases LSV |

**Conclusión:** hace falta una recopilación propia.

## 2. Qué capturar

Para cada una de las 24 letras evaluables y NONE, en las tres particiones:

- **Personas:** diestras y zurdas; cada persona usa su mano dominante y, si lo desea, también la otra.
  Una persona no cuenta dos veces por cambiar de mano.
- **Anatomía:** tamaños de mano variados, niños, jóvenes y adultos según el público de la plataforma,
  y variedad de tonos de piel. Si se registra el tono, que sea de forma voluntaria y autodeclarada, con
  una escala amplia; nunca se infiere de la imagen.
- **Condiciones:** luz natural, luz artificial cálida y fría, contraluz moderado; fondos lisos y con
  objetos; distancia cercana (mano ≈ 40 % de la altura del cuadro), media (≈ 25 %) y lejana (≈ 15 %);
  cámaras de portátil y de móvil.
- **Variantes válidas:** P (dos configuraciones), cualquier variante que señalen las personas revisoras.
- **Negativos (NONE):** posiciones neutras, gestos ajenos al alfabeto y **transiciones** entre letras,
  revisadas contra las 27 letras.
- **Errores típicos etiquetados:** la ejecución incorrecta se guarda con la letra pretendida y un código
  de error (`THUMB_OUTSIDE`, `FINGERS_SPREAD`, `NO_MOTION`, `INCOMPLETE_MOTION`…). Sirven para medir si
  las correcciones son acertadas, no para entrenar la clase positiva.

## 3. Formato de almacenamiento

Se mantiene el contrato existente (`shared/lsv/recording.js`, `version: 1`), que ya guarda **solo
landmarks**, nunca imágenes:

```jsonc
{
  "version": 1,
  "id": "s_0001",                      // seudónimo de la ejecución
  "label": "V",                        // letra o NONE
  "participantId": "p_017",            // código estable, sin nombre
  "sessionId": "ses_04",
  "partition": "test",                 // fijada por persona antes de capturar
  "consent": true,
  "reviewStatus": "PENDING_LSV_REVIEW",
  "observedHand": "Left",              // lateralidad observada (sin reflejar)
  "requestedHand": "AUTO",
  "coordinateConvention": "MEDIAPIPE_UNMIRRORED",
  "frames": [{ "t": 0, "width": 640, "height": 480, "hand": "Left", "trackId": "t1",
               "points": [[0.51, 0.62, 0.0], "… 21 puntos [x, y, z]"] }],
  "reviewEvidence": { "language": "LSV", "variantReference": "…", "motionReviewed": true }
}
```

Metadatos adicionales propuestos (en un registro privado aparte, enlazado por `participantId` o
`sessionId`, no dentro del lote compartido): mano dominante autodeclarada, rango de edad, cámara,
iluminación, fondo, distancia y código de error. Así el lote de landmarks puede compartirse con
quienes evalúan sin exponer datos personales.

## 4. Consentimiento y privacidad

1. Consentimiento explícito por persona y por uso (captura, revisión, entrenamiento, evaluación),
   revocable. Menores, solo con autorización de sus representantes.
2. Por defecto se guardan **landmarks**. Grabar video para la revisión lingüística requiere un
   consentimiento separado, almacenamiento con acceso restringido y un plazo de borrado.
3. Los lotes no contienen nombres, contactos ni rutas privadas. Se guardan fuera de `Frontend/public` y
   fuera de Git (`.local/`, `/datos-entrenamiento/`).
4. No se descarga ni se reutiliza material de terceros sin permiso verificado.

## 5. Particiones y entrenamiento

- División **por persona** antes de capturar: train / validation / test disjuntos (`sample-conflicts.js`
  y `training-data.js` ya rechazan solapamientos y copias transformadas).
- Mínimos propuestos (heredados): 6/2/2 personas, ≥ 3 ejecuciones por persona y clase, ambas manos en
  cada partición y ≥ 20 ejecuciones de test por clase. Las personas revisoras pueden exigir más.
- Orden de uso:
  1. **Calibrar umbrales** (`thresholds.js`) por letra con *train*; ajustar con *validation*.
  2. Medir una única vez en *test* con `pnpm lsv:engine:evaluate lote.json --partition test`.
  3. Con datos suficientes, entrenar un clasificador sobre los rasgos de `features.js` (k-NN, SVM o
     red pequeña) y mantener la geometría como validador y fuente de correcciones.
- Los aumentos (reflejo, ruido) solo se generan dentro de *train*, después de dividir. Un reflejo no
  es una persona zurda nueva.

## 6. Captura con las herramientas existentes

El laboratorio `/student/practice/model-lab` ya captura, revisa y exporta muestras con este contrato
(ver [lsv-alphabet-training.md](lsv-alphabet-training.md) §«Capturar los datos que faltan»). Para el
motor geométrico no hace falta otro formato: `lsv:engine:evaluate` lee los mismos lotes.
