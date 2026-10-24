# Preparación de la entrega del Módulo II

`pnpm academic:package` actualiza `modulo-ii-franciely vivas/` y crea dentro
`VocesSilentes-Modulo-II.zip`, inferior a **10 000 000 bytes**. La carpeta y el ZIP contienen la
misma versión. Se utiliza el código actual, incluidas cuentas, fotos, dashboard y TLS.

El script principal coordina la preparación, validación y sustitución de la carpeta.
`scripts/module-ii-source.ps1` selecciona código y configuración; `module-ii-proofs.ps1` incorpora
únicamente resultados completos y sus capturas. Las plantillas actuales están en `docs/module-ii/package/`.

La entrega incluye frontend/backend, recursos importados, pruebas, migraciones, ejemplos de entorno,
CA pública, configuración de despliegue y lockfile. La documentación se limita a instalación,
arquitectura, API y resultados actuales. Se excluyen instrucciones de agentes, configuración del
editor/CI, historiales, galerías internas, recursos de marca sin uso, dependencias instaladas,
generados, builds, logs y secretos. Las fuentes Tailwind correspondientes a las galerías excluidas
se retiran solo del CSS copiado al paquete; las pantallas de aplicación conservan sus fuentes.

El manifiesto entregado conserva los comandos de instalación, demo, desarrollo y verificación.
Se retira únicamente `academic:package`, porque las herramientas para generar la entrega pertenecen
al repositorio de trabajo y no son necesarias para ejecutar la copia distribuida.

Los datos personales del TXT se conservan. Los tres campos de acceso local se sincronizan con las
credenciales públicas reales del seed; no se distribuye una contraseña privada como acceso de demo.
No se modifican usuarios ni bases remotas durante el empaquetado. Los SQL de estructura/datos no
se regeneran ni cambian sus hashes. El archivo 05 reúne los procedimientos de los buckets privados.

La carpeta se prepara en un staging nuevo bajo `.local/`. Antes de sustituir nada se comprueban
contenido, imports, enlaces, certificado y archivos requeridos, y se genera el ZIP con límite de
tamaño. Se validan las rutas absolutas dentro del workspace antes de mover directorios. La versión
anterior completa se conserva en el staging como `anterior/`, fuera del paquete distribuido.

La selección se valida también con `Backend/scripts/verify-module-ii-package.js` sobre una extracción
del ZIP. Las rutas de `.env`, dependencias, cliente generado y resultados `.local` se tratan como
configuración o salidas de ejecución, no como archivos que deban distribuirse. Después se comprueba
la instalación y los controles desde la copia extraída, sin modificar el proyecto principal.

La revisión del 23 de octubre comprobó 1.133 referencias sin archivos ausentes, 659 fuentes de
frontend/backend idénticas y datos personales preservados. La copia extraída instaló 792 paquetes
desde la caché local con el lockfile fijo, sin descargas; `pnpm verify` terminó con 218 pruebas
aprobadas. El bundle CSS coincidió con el del proyecto principal.
Desde esa misma copia pasó la revisión de Chrome de cinco usuarios/reportes, imágenes, visor,
resolución/reapertura y 40 combinaciones de vistas; los resultados completos se incorporan al paquete.
