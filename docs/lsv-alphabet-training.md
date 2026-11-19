# Entrenamiento progresivo del abecedario LSV

Esta entrega conserva MediaPipe HandLandmarker y `LSV_DTW_1NN`, con 16 observaciones de 66 rasgos.
Es preparación de un experimento con datos reales, **no un reconocimiento validado de las 27 letras**.
Consultar [auditoría por letra](lsv-alphabet-audit.md), [fuentes](lsv-alphabet-sources.json) y
[resultados de verificación](lsv-alphabet-verification.md).

## Estado y alcance

La usuaria confirmó consentimiento y finalidad educativa el 18 de noviembre de 2026. La
[declaración recibida](lsv-owner-consent-2026-11-18.json) se conserva separada: no se inventaron
identidades, aprobaciones lingüísticas ni particiones. Los archivos originales siguen intactos.
Las nueve muestras provisionales disponibles carecen de esa documentación por ejecución; ninguna
es elegible para el entrenador revisado. No se generó un modelo ampliado ni métricas reales.

El modelo público `vowels-demo-v1` conserva exactamente sus bytes, etiquetas y límites. Sigue
siendo una demostración sin evaluación independiente ni revisión experta. No se activa ningún
modelo nuevo para calificar. Autenticación, administración, currículo y progreso no se modifican.

## Pipeline conservado y cambios

| Responsabilidad                  | Implementación                                                      |
| -------------------------------- | ------------------------------------------------------------------- |
| Etiquetas y letras temporales    | `shared/lsv/labels.js`: 27 letras, NONE y J/Ñ/Z                     |
| Contrato de captura              | `recording.js`, `recording-frames.js`, `review-evidence.js`         |
| Elegibilidad y calidad           | `training-eligibility.js`, `sequence-quality.js`, `sample-audit.js` |
| Independencia                    | `sample-conflicts.js`, `training-data.js`                           |
| Selección y calibración DTW      | `train.js`, `train-prototypes.js`                                   |
| Evaluación                       | `model-evaluation.js`, `metrics.js`, `readiness.js`                 |
| Auditoría y reproducibilidad CLI | `Backend/scripts/lsv-readiness.js`, `lsv/training-fingerprint.js`   |

- Se conserva `screen-pose-wrist-v1`: corrección de aspecto, centro en muñeca, escala de palma,
  orientación y trayectoria. No se reflejan ni rotan datos ni se fabrican fotogramas.
- Se añaden comprobaciones de palma por frame, escala relativa y saltos de muñeca. Son guardas
  técnicas conservadoras, no umbrales lingüísticos validados. Una secuencia completamente
  congelada no sirve para J, Ñ o Z; que tenga movimiento tampoco demuestra que sea correcto.
- La huella normalizada detecta copias trasladadas/escaladas o con tiempos cambiados. También se
  rechazan IDs, ejecuciones y ventanas repetidas/solapadas. Una transformación no es otra persona.
  Estos controles no pueden demostrar que dos códigos distintos sean dos personas diferentes.
- Se mantiene DTW/1NN. La selección de hasta tres ejecuciones por clase/mano es determinista y
  busca diversidad exclusivamente en train. El percentil 95 de validation usa nearest rank y
  radios por etiqueta/mano; el modelo anterior conserva sus radios globales.
- Test no selecciona prototipos ni ajusta radios. El entrenador vuelve a validar los registros
  recibidos para impedir que otro llamador eluda consentimiento, geometría o particiones.
- El flujo provisional también rechaza entrenamiento con participante/consentimiento desconocidos
  o videos sin permiso documentado. Su confirmación manual sigue separada de una aprobación LSV.
- No se añadió otra arquitectura ni dependencias. Estas decisiones tienen pruebas de software,
  **no una mejora de precisión demostrada** con personas reales.

## Contrato documental

El JSON de muestras mantiene `version: 1`, `samples`, IDs seudónimos, partición, consentimiento,
revisión y frames originales. Las exportaciones antiguas se pueden inspeccionar; una bandera
`APPROVED_LSV` sin evidencia ya no basta para entrenar.

Cada muestra del flujo revisado incorpora `reviewEvidence`:

| Campo                 | Contenido                                                                        |
| --------------------- | -------------------------------------------------------------------------------- |
| `language`            | Literal `LSV`; no se aceptan etiquetas ASL como sustituto                        |
| `consentReference`    | Código de la declaración de consentimiento correspondiente a la persona y al uso |
| `permissionReference` | Código del permiso para extracción/exportación/entrenamiento educativo           |
| `reviewReference`     | Código del registro de revisión de la ejecución original y su etiqueta           |
| `variantReference`    | Código de la fuente y variante LSV comprobadas por quien revisa                  |
| `reviewedAt`          | Fecha de la revisión declarada                                                   |
| `motionReviewed`      | Debe ser true para J, Ñ y Z tras revisar el movimiento completo                  |
| `negativeFor`         | En NONE, letras frente a las que la ejecución fue revisada como negativa         |
| `negativeDescription` | En NONE, descripción de la postura o transición observada                        |

Los códigos admiten 1–64 caracteres ASCII alfanuméricos, guion y guion bajo. No incluir nombres,
contactos ni rutas privadas. Guardar la evidencia original por separado y controlar su acceso y
retención. La aplicación registra declaraciones; no autentica la competencia del revisor.

Una B puede ser negativa para un piloto de vocales, pero no para un modelo que incluya B.
No cambiar automáticamente su etiqueta: revisar el original, el alcance y la autorización.
Para el abecedario completo, NONE necesita revisión frente a las 27 letras. Usar manos visibles
en posturas ajenas al abecedario y transiciones revisadas. Ausencia de mano y fallos de detección
se rechazan en captura; no se rellenan con puntos ficticios para crear NONE.

## Capturar los datos que faltan

1. Acordar con personas competentes en LSV las variantes, protocolo temporal y criterios.
   Revisar las fuentes venezolanas inventariadas; las fichas y rótulos no validan una ejecución.
2. Mantener un registro privado con código estable por persona, consentimiento y referencias de
   permisos. Confirmar correspondencia entre sesiones/videos sin inferir identidades de rostros.
3. Asignar cada persona a **una sola** partición antes de capturar. No moverla para mejorar métricas.
   Variantes, cámaras, fondos e iluminación deben variar dentro de cada partición.
4. Abrir `/student/practice/model-lab` con una sesión USER y elegir el flujo revisado.
   Seleccionar una letra o NONE. Activar cámara solo por una acción explícita y capturar una ejecución
   completa. La captura en vivo dura tres segundos; para otra duración, importar un intervalo real
   de 1,5–6 segundos. No alargarlo copiando fotogramas.
   Para registrar izquierda/derecha, seleccionar «Mano que se solicita capturar»: el detector mantiene
   sus coordenadas originales y el guardado exige que la mano observada coincida. La muestra sigue
   pendiente de revisión; consultar [la auditoría de lateralidad y ayuda educativa](lsv-left-hand-feedback.md).
5. Para video local autorizado, registrar origen, permiso, ejecución e intervalo completo. Las
   27 letras y NONE están disponibles. Los rótulos catalogados son aproximaciones, no límites de señas.
6. Inspeccionar la ejecución original, no solo puntos. Registrar revisor, referencias, variante,
   movimiento completo cuando corresponda y alcance de NONE. Solo entonces confirmar revisión.
7. Exportar lotes de hasta 100 muestras. La CLI combina hasta 3000, en archivos de hasta 16 MB.
   Conservar códigos de persona y ejecución entre lotes; no duplicar la misma toma con otros IDs.
8. Auditar antes de entrenar. Corregir capturas rechazadas volviendo a registrar una ejecución real;
   no corregir etiquetas, permisos, consentimientos o lateralidades por inferencia del programa.

Los mínimos propuestos son 6/2/2 personas distintas en train/validation/test, tres o más ejecuciones
por persona/clase, ambas manos **en cada partición**, y al menos 20 ejecuciones test por clase.
Un plan técnico posible: 6 × 3 train, 2 × 3 validation y 2 × 10 test por clase: 44 × 28 = 1232
ejecuciones reales, con participantes de ambas lateralidades en cada grupo. Una persona no cuenta
dos veces por usar otra mano. Son mínimos para evaluar, no una garantía de fiabilidad ni una
aprobación lingüística. Las personas revisoras pueden exigir más diversidad y repeticiones.

Las 27 fichas existentes se consultan en el laboratorio de **desarrollo local**, con crédito y
revisión pendiente. Las demás fichas no se añaden a la distribución de producción. No se extrajeron
muestras de dibujos, fotografías, material protegido externo ni corpus de otras lenguas.

## Comandos reproducibles (PowerShell, raíz del checkout)

```powershell
pnpm install --frozen-lockfile
pnpm lsv:readiness
pnpm lsv:readiness .local/lote-1.json .local/lote-2.json --json --output .local/auditoria.json
pnpm lsv:train .local/lote-1.json .local/lote-2.json --output .local/alfabeto-experimental
pnpm lsv:train .local/vocales-revisadas.json --labels A,E,I,O,U,NONE --output .local/vocales-revisadas
```

Sin archivos, la auditoría informa ausencia de datos, no busca datos privados. Sin `--labels`,
el entrenador exige las 27 letras y NONE en los tres grupos. Un experimento reducido exige al menos
una letra y NONE con personas disjuntas y evidencia completa. Puede producir un artefacto de
investigación con datos todavía insuficientes según los mínimos; lo informa en `dataReadiness` y
bloquea candidatas de publicación. No debe presentarse como reconocimiento fiable.

Se escriben `lsv-model.json` y `evaluation.json` únicamente si pasan los contratos. Guardarlos fuera
de `Frontend/public`. No se cargan ni publican automáticamente. El laboratorio permite aplicarlos
solo mediante la acción explícita existente para practicar; no registra aciertos académicos.

## Métricas y comparación de arquitecturas

La evaluación exporta accuracy, precision/recall/F1 por clase, macro precision/recall/F1, matriz densa,
abstenciones UNSURE, falsos positivos sobre NONE y desglose por mano. UNSURE cuenta como error;
un NONE correctamente reconocido se distingue de una abstención incierta. Divisiones sin denominador
son null; macro usa todas las clases seleccionadas y cero para valores indefinidos, política explícita
en el informe. Se conservan las predicciones por ejecución y códigos seudónimos en el reporte privado.

`reproducibility` conserva versión de pipeline/Node, hashes de archivos/modelo y SHA-256 del conjunto
test **con frames crudos validados**, etiquetas y personas. Comparar DTW con una alternativa requiere
mismo alcance, misma partición por persona y misma huella test; mismos criterios para NONE/UNSURE
y selección de hiperparámetros solo en train/validation. Registrar variantes y soporte por mano.
La matemática común está en `classificationMetrics`. No reutilizar test para elegir arquitectura
repetidamente: reservar otra cohorte si se utiliza para tomar decisiones.

No existe ahora un test LSV independiente aprobado. Por ello no se reemplazó DTW ni se publicaron
comparaciones numéricas de arquitecturas. Las métricas de fixtures son exclusivamente pruebas de
software y no forman parte de los entregables de entrenamiento real.
