# Genera una entrega local revisable; nunca lee .env ni credenciales del proveedor.
$ErrorActionPreference = 'Stop'
$academicRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$academicDelivery = Join-Path $academicRoot 'entrega-modulo-ii'
$academicStage = Join-Path $academicRoot ('.local/academic-package-' + [guid]::NewGuid())
$academicSource = Join-Path $academicStage 'proyecto'
New-Item -ItemType Directory -Path $academicSource -Force | Out-Null
# El staging siempre es un directorio nuevo bajo el workspace; no se elimina trabajo previo.
if (-not [IO.Path]::GetFullPath($academicStage).StartsWith($academicRoot + [IO.Path]::DirectorySeparatorChar)) {
    throw 'Staging fuera del workspace'
}
$academicRootFiles = @('README.md', 'AGENTS.md', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml',
    '.npmrc', '.nvmrc', '.node-version', '.editorconfig', '.gitattributes', '.gitignore',
    '.prettierrc.json', '.prettierignore', 'eslint.config.js', 'netlify.toml')
$academicFiles = @(git -C $academicRoot ls-files --cached --others --exclude-standard) |
    Sort-Object -Unique | Where-Object {
        ($_ -in $academicRootFiles -or $_ -match '^(Frontend|Backend|docs|scripts|\.github|\.vscode)/') -and
        $_ -notmatch '(^|/)(node_modules|generated|dist|coverage|\.vercel|\.local)/' -and
        $_ -notmatch '^Frontend/src/assets/Logos/' -and
        ($_ -notmatch '(^|/)\.env($|\.)' -or $_ -match '(^|/)\.env\.example$') -and
        $_ -notmatch '\.(zip|log)$'
    }
foreach ($academicFile in $academicFiles) {
    $academicInput = Join-Path $academicRoot $academicFile
    if (-not (Test-Path -LiteralPath $academicInput -PathType Leaf)) { continue }
    $academicTarget = Join-Path $academicSource $academicFile
    New-Item -ItemType Directory -Path (Split-Path -Parent $academicTarget) -Force | Out-Null
    Copy-Item -LiteralPath $academicInput -Destination $academicTarget
}
foreach ($academicSql in @('01_schema.sql', '02_seed.sql', '03_verificacion.sql')) {
    Copy-Item -LiteralPath (Join-Path $academicRoot ('docs/module-ii/sql/' + $academicSql)) `
        -Destination (Join-Path $academicDelivery $academicSql) -Force
}
$academicUiResult = Join-Path $academicRoot '.local/module-ii-review/results.json'
if (-not (Test-Path -LiteralPath $academicUiResult)) { throw 'Ejecutar primero pnpm academic:verify' }
$academicProof = Get-Content -LiteralPath $academicUiResult -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $academicProof.completed) { throw 'La revisión de formularios no terminó correctamente' }
$academicEvidence = Join-Path $academicDelivery 'pruebas'
New-Item -ItemType Directory -Path $academicEvidence -Force | Out-Null
Copy-Item -LiteralPath $academicUiResult -Destination (Join-Path $academicEvidence 'resultados-ui.json') -Force
$academicStageEvidence = Join-Path $academicStage 'pruebas'
New-Item -ItemType Directory -Path $academicStageEvidence -Force | Out-Null
Copy-Item -LiteralPath $academicUiResult -Destination (Join-Path $academicStageEvidence 'resultados-ui.json')
foreach ($academicCapture in @($academicProof.captures) + @($academicProof.inputImage)) {
    if ([IO.Path]::GetFileName($academicCapture) -ne $academicCapture -or $academicCapture -notlike '*.png') {
        throw 'Nombre de captura inválido'
    }
    $academicCapturePath = Join-Path (Split-Path -Parent $academicUiResult) $academicCapture
    Copy-Item -LiteralPath $academicCapturePath -Destination $academicEvidence -Force
    Copy-Item -LiteralPath $academicCapturePath -Destination $academicStageEvidence
}
Get-ChildItem -LiteralPath $academicDelivery -File | Where-Object { $_.Extension -ne '.zip' } |
    ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $academicStage }
$academicFiles | Set-Content -LiteralPath (Join-Path $academicStage 'ARCHIVOS-FUENTE.txt') -Encoding UTF8
$academicPrivateFiles = @(Get-ChildItem -LiteralPath $academicSource -Recurse -File |
    Where-Object { $_.Name -like '.env*' -and $_.Name -ne '.env.example' })
if ($academicPrivateFiles.Count -ne 0) { throw 'La entrega contiene configuración privada' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$academicZip = Join-Path $academicDelivery 'VocesSilentes-Modulo-II.zip'
$academicStream = [IO.File]::Open($academicZip, [IO.FileMode]::Create)
$academicArchive = [IO.Compression.ZipArchive]::new($academicStream, [IO.Compression.ZipArchiveMode]::Create)
try {
    Get-ChildItem -LiteralPath $academicStage -Recurse -File | ForEach-Object {
        $academicEntry = $_.FullName.Substring($academicStage.Length + 1).Replace('\', '/')
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($academicArchive, $_.FullName,
            $academicEntry, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
} finally { $academicArchive.Dispose(); $academicStream.Dispose() }
$academicZipFile = Get-Item -LiteralPath $academicZip
if ($academicZipFile.Length -ge 10000000) { throw 'El ZIP debe ser inferior a 10 MB decimales' }
Write-Output ('ZIP: ' + $academicZipFile.FullName)
Write-Output ('Bytes: ' + $academicZipFile.Length)
