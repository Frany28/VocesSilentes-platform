# Prepara una entrega autocontenida y conserva la versión anterior fuera del paquete.
param([string]$Destination = 'modulo-ii-franciely vivas')
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'module-ii-source.ps1')
. (Join-Path $PSScriptRoot 'module-ii-proofs.ps1')
$packageRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$packageDelivery = [IO.Path]::GetFullPath((Join-Path $packageRoot $Destination))
$packageStage = Join-Path $packageRoot ('.local/module-ii-package-' + [guid]::NewGuid())
$packagePrepared = Join-Path $packageStage 'entrega'
$packagePrevious = Join-Path $packageStage 'anterior'
foreach ($packagePath in @($packageDelivery, $packageStage, $packagePrepared, $packagePrevious)) {
    if (-not $packagePath.StartsWith($packageRoot + [IO.Path]::DirectorySeparatorChar)) {
        throw 'La ruta de entrega debe permanecer dentro del workspace'
    }
}
if (-not (Test-Path -LiteralPath (Join-Path $packageDelivery 'DATOS-DEL-ESTUDIANTE.txt'))) {
    throw 'Falta el TXT de la estudiante en la carpeta de destino; no se inventan datos personales'
}
New-Item -ItemType Directory -Path $packagePrepared -Force | Out-Null
Copy-ModuleSource $packageRoot (Join-Path $packagePrepared 'proyecto')
$packageTemplates = Join-Path $packageRoot 'docs/module-ii/package'
foreach ($packageDocument in @('README.md', 'PRUEBAS.md')) {
    Copy-Item -LiteralPath (Join-Path $packageTemplates $packageDocument) -Destination $packagePrepared
}
foreach ($packageSql in @('01_schema.sql', '02_seed.sql', '03_verificacion.sql', '04_verificacion_supabase.sql')) {
    Copy-Item -LiteralPath (Join-Path $packageRoot ('docs/module-ii/sql/' + $packageSql)) -Destination $packagePrepared
}
$packageStorage = @('-- Solo Supabase de desarrollo autorizado; revisar destino y permisos antes de aplicar.')
foreach ($packageSql in @('001_report_evidence.sql', '002_profile_photos.sql')) {
    $packageStorage += [IO.File]::ReadAllText((Join-Path $packageRoot ('Backend/storage/' + $packageSql)))
}
Write-ModuleText (Join-Path $packagePrepared '05_storage_supabase.sql') ($packageStorage -join "`n")
$packageStudent = [IO.File]::ReadAllText((Join-Path $packageDelivery 'DATOS-DEL-ESTUDIANTE.txt'))
# Solo se sustituyen accesos de demostración: nombres, cédula y enlace se conservan.
$packageCredentials = @{
    '(?m)^(Usuario de demostraci\u00f3n ADMIN[^:]*:)[^\r\n]*' = '${1} academic_1@example.invalid'
    '(?m)^(Usuario de demostraci\u00f3n Estudiante[^:]*:)[^\r\n]*' = '${1} academic_2@example.invalid'
    '(?m)^(Contrase\u00f1a de demostraci\u00f3n:)[^\r\n]*' = '${1} Solo practica local 2026!'
}
foreach ($packagePattern in $packageCredentials.Keys) {
    if ([regex]::Matches($packageStudent, $packagePattern).Count -ne 1) { throw 'Formato de credenciales ambiguo en TXT' }
    $packageStudent = [regex]::Replace($packageStudent, $packagePattern, $packageCredentials[$packagePattern])
}
Write-ModuleText (Join-Path $packagePrepared 'DATOS-DEL-ESTUDIANTE.txt') $packageStudent
Copy-ModuleProofs $packageRoot $packagePrepared
$packageInventory = Get-ChildItem -LiteralPath (Join-Path $packagePrepared 'proyecto') -Recurse -File |
    ForEach-Object { $_.FullName.Substring($packagePrepared.Length + 1).Replace('\', '/') } | Sort-Object
Write-ModuleText (Join-Path $packagePrepared 'ARCHIVOS-FUENTE.txt') (($packageInventory -join "`n") + "`n")
& node (Join-Path $packageRoot 'Backend/scripts/verify-module-ii-package.js') $packagePrepared
if ($LASTEXITCODE -ne 0) { throw 'La entrega no pasó la verificación de contenido e imports' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$packageZip = Join-Path $packageStage 'VocesSilentes-Modulo-II.zip'
[IO.Compression.ZipFile]::CreateFromDirectory($packagePrepared, $packageZip, [IO.Compression.CompressionLevel]::Optimal, $false)
$packageBytes = (Get-Item -LiteralPath $packageZip).Length
if ($packageBytes -ge 10000000) { throw 'El ZIP debe ser inferior a 10 MB decimales' }
# Ambas rutas se validaron antes del movimiento recursivo; no se borra la entrega anterior.
Move-Item -LiteralPath $packageDelivery -Destination $packagePrevious
try { Move-Item -LiteralPath $packagePrepared -Destination $packageDelivery }
catch { Move-Item -LiteralPath $packagePrevious -Destination $packageDelivery; throw }
Copy-Item -LiteralPath $packageZip -Destination $packageDelivery
Write-Output ('Entrega actualizada: ' + $packageDelivery)
Write-Output ('ZIP: ' + (Join-Path $packageDelivery 'VocesSilentes-Modulo-II.zip'))
Write-Output ('Bytes: ' + $packageBytes)
Write-Output ('Archivos fuente: ' + $packageInventory.Count)
Write-Output ('Copia anterior conservada: ' + $packagePrevious)
