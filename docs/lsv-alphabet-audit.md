# Auditoría del abecedario LSV — 18 de noviembre de 2026

Base de trabajo: `Frany28/VocesSilentes-platform`, `origin/main` en `ac647c6`.
No se entrenó un modelo ampliado. **Ninguna de las 27 letras está validada** con los datos disponibles.
El [informe automático](lsv-alphabet-audit-2026-11-18.json) describe las nueve muestras provisionales;
las cifras inferiores distinguen sus derivados y no los suman como ejecuciones independientes.

## Consentimiento y procedencia

La usuaria confirmó que los videos y las muestras existentes cuentan con consentimiento para
fines educativos. Se registra literalmente en [la declaración](lsv-owner-consent-2026-11-18.json).
Los registros originales todavía tienen `consent: null`, participante desconocido, revisión pendiente
y ninguna partición. No se reescribieron para simular correspondencias por persona o aprobación LSV.
La declaración educativa no sustituye esos metadatos ni identifica a una persona revisora.

| Recurso local | Disponibilidad comprobada | Uso y limitaciones |
| --- | --- | --- |
| Manual Fuentes, 2022 | 27 WebP; páginas 5/6 y hash del PDF en `provenance.json` | Referencias educativas; derechos declarados por la usuaria y revisión LSV pendiente. No son secuencias de cámara |
| Cuatro MP4 del manifiesto | 53 583 483 bytes; los cuatro hashes coinciden con `datos-entrenamiento/manifest.json` | Material real aportado; requiere correspondencia de participantes y revisión por ejecución |
| Catálogo de rótulos | 83 entradas: 27 letras × 3 fuentes, más LL y RR | Texto observado aproximadamente por segundo, no límites completos de gestos ni identidades |
| Cuarentena técnica | 31 ventanas; 24 con geometría válida, 7 rechazadas | 19 válidas con etiquetas del piloto y 5 válidas sin etiqueta. Ninguna aprobada LSV |
| Exportaciones revisadas | `prepared-samples.json` y `training-ready.json`: cero muestras | No existe un dataset aprobado para train/validation/test |
| Muestras provisionales | 9: A×2, E×2, I×2, O, U, NONE; mano Right | Dos tracks de origen, **cero participantes independientes confirmados**; todos los consentimientos del archivo siguen null |
| Modelo demo público | 9 prototipos, solo vocales y NONE | LOCAL_PROVISIONAL; métricas/particiones null; revisión experta pendiente |
| Otro MP4 local de vocales | Archivo fuera del manifiesto de los cuatro orígenes | Sin ficha de procedencia/revisión asociada; excluido del entrenamiento |
| Recursos de otras lenguas | Inventarios técnicos anteriores (ASL/CASL, LSP, LSFB) | No son LSV; no se incorporaron como clases ni participantes LSV |

Orígenes del manifiesto: Visogestual, Periodista Noctámbula, Ysled Guanchez y
«Lengua de Señas Venezolana: Abecedario». El inventario anterior de URLs está en
`.local/lsv-video-review/sources.json`; los archivos privados no se suben al PR.
Las ventanas y las nueve muestras pueden proceder de las mismas ejecuciones: no se suman.

SHA-256 del demo, sin cambios:
`e129e281be5833b1df450ec207eb4f23cb0e5e8ed5347e23b5f07e5a45bc927e`.

## Estado por letra

«Rótulos» cuenta fuentes del catálogo, no personas ni muestras entrenables. «Ventanas» y «Geometría»
se refieren a la cuarentena existente. «Provisionales» se refiere al archivo de nueve muestras.
En todas las filas hay cero ejecuciones con revisión LSV documentada y cero participantes confirmados.
Las letras que aparecen en NONE del piloto no se reasignan automáticamente como datos de consonantes.

| Letra | Ficha | Fuentes con rótulo | Ventanas | Geometría válida | Provisionales | Revisadas LSV | Personas confirmadas | Estado para evaluar |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | Sí | 3 | 4 | 4 | 2 | 0 | 0 | NO_DATA |
| B | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| C | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| D | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| E | Sí | 3 | 3 | 2 | 2 | 0 | 0 | NO_DATA |
| F | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| G | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| H | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| I | Sí | 3 | 4 | 3 | 2 | 0 | 0 | NO_DATA |
| J | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| K | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| L | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| M | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| N | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| Ñ | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| O | Sí | 3 | 3 | 2 | 1 | 0 | 0 | NO_DATA |
| P | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| Q | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| R | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| S | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| T | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| U | Sí | 3 | 3 | 2 | 1 | 0 | 0 | NO_DATA |
| V | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| W | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| X | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| Y | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| Z | Sí | 3 | 0 | 0 | 0 | 0 | 0 | NO_DATA |
| NONE | No aplica | No aplica | 7 | 6 | 1 | 0 | 0 | NO_DATA |

Pendientes exactas: **A, B, C, D, E, F, G, H, I, J, K, L, M, N, Ñ, O, P, Q, R, S, T, U, V, W, X, Y, Z
y NONE**. Las vocales tienen candidatos provisionales; las otras 22 letras tienen referencias y
rótulos, pero no muestras de entrenamiento revisadas. Los siete intervalos sin etiqueta siguen
sin etiqueta: no se inventaron asignaciones.

## J, Ñ y Z

- **J:** [Oviedo, ULA, 2000, Parte 3, pp. 56–58](https://cultura-sorda.org/wp-content/uploads/2015/03/Oviedo_Estructura_LSV_Parte3_de_6.pdf)
  describe dos posiciones y un giro de muñeca. Esto justifica conservar orientación y secuencia;
  no se implementa una trayectoria de ASL como regla de J en LSV.
- **Ñ:** el manual local conserva flechas y [Martínez, UPEL, 2018, p. 66, gráfico 9](https://mail.espacio.digital.upel.edu.ve/index.php/TD/article/download/1784/1679/5428)
  documenta formas y variación del alfabeto. Falta un protocolo temporal completo aprobado para
  las ejecuciones de este dataset.
- **Z:** la ficha local conserva flechas. No se obtuvo una descripción lingüística primaria
  suficiente para fijar automáticamente dirección, mano y trayectoria de las variantes.
  Su protocolo sigue pendiente; no se completa por analogía con ASL.

Las tres clases conservan revisión temporal obligatoria. Validar movimiento geométrico o duración
no demuestra corrección lingüística.

## Fuentes y permisos investigados

Se priorizaron [FEVENSOR en el sitio de ASC](https://ascpaginaweb2018.wixsite.com/asc2021/manualfevensor1999),
[los libros de ASC](https://ascpaginaweb2018.wixsite.com/asc2021/librosdelsv), su
[formación con instructores sordos](https://ascpaginaweb2018.wixsite.com/asc2021/curso-de-lsv)
y las fuentes académicas citadas. El [catálogo CNLSE](https://cnlse.es/es/recursos/biblioteca/manual-de-lengua-de-senas-venezolana)
identifica el manual FEVENSOR 1999 como material con copyright. Disponibilidad para consulta no
acredita una licencia para extraer datos o redistribuir imágenes.

El [inventario de fuentes](lsv-alphabet-sources.json) registra URL, autor, ubicación, alcance y
derechos encontrados. No se copiaron ilustraciones externas ni se descargaron corpus. No se
contactó a instituciones. El sitio histórico fevensor.20m.com no fue accesible y un espejo del
manual devolvió 404; no se trató ninguno como evidencia de permiso o descripción verificada.

## Resultado de entrenamiento

Se ejecutó el entrenador revisado sobre el export provisional disponible. Salió con código 1
antes de escribir artefactos: faltan partición, participante y revisión documentada en las muestras.
No se generó `lsv-model.json` ampliado ni `evaluation.json` de datos reales.

Accuracy, precision, recall, F1 macro, matriz de confusión y falsos positivos NONE del modelo
ampliado: **NO MEDIDOS**. No existe conjunto de prueba independiente aprobado. La confirmación
educativa queda registrada y el siguiente trabajo humano es completar correspondencias,
revisión por ejecución y captura de participantes independientes.

[Instrucciones reproducibles y protocolo de captura](lsv-alphabet-training.md).
