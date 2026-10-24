# Conserva resultados reales y únicamente las capturas identificadas por la ejecución completa.
function Copy-ModuleProofs([string]$Root, [string]$Target) {
    $proofTarget = Join-Path $Target 'pruebas'
    New-Item -ItemType Directory -Path $proofTarget -Force | Out-Null
    $proofPath = Join-Path $Root '.local/module-ii-review/results.json'
    $proofUi = Get-Content -LiteralPath $proofPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if (-not $proofUi.completed) { throw 'Ejecutar primero pnpm academic:verify' }
    Copy-Item -LiteralPath $proofPath -Destination (Join-Path $proofTarget 'resultados-ui.json')
    foreach ($proofCapture in @($proofUi.captures) + @($proofUi.inputImage)) {
        if ([IO.Path]::GetFileName($proofCapture) -ne $proofCapture -or $proofCapture -notlike '*.png') {
            throw 'Nombre de captura inválido'
        }
        Copy-Item -LiteralPath (Join-Path (Split-Path -Parent $proofPath) $proofCapture) -Destination $proofTarget
    }
    $proofAccounts = Join-Path $Root '.local/account-ui-review/results.json'
    $proofAccountResult = Get-Content -LiteralPath $proofAccounts -Raw -Encoding UTF8 | ConvertFrom-Json
    if (-not $proofAccountResult.completed) { throw 'Falta la comprobación completa de cuentas' }
    Copy-Item -LiteralPath $proofAccounts -Destination (Join-Path $proofTarget 'cuentas-ui.json')
    Copy-Item -LiteralPath (Join-Path $Root '.local/account-ui-review/student-profile-photo.png') `
        -Destination (Join-Path $proofTarget 'perfil-con-foto.png')
    $proofRemote = Join-Path $Root '.local/live-functional-results.json'
    $proofRemoteResult = Get-Content -LiteralPath $proofRemote -Raw -Encoding UTF8 | ConvertFrom-Json
    if (-not ($proofRemoteResult.completed -and $proofRemoteResult.temporaryRecordsRemoved -and $proofRemoteResult.storageCleanup)) {
        throw 'Falta una comprobación remota terminada y con datos temporales retirados'
    }
    Copy-Item -LiteralPath $proofRemote -Destination (Join-Path $proofTarget 'integracion-supabase-s3.json')
    foreach ($proofPair in @(
        @('supabase-franciely-import.json', 'supabase-importacion.json'),
        @('supabase-franciely-verification.json', 'supabase-verificacion.json')
    )) {
        Copy-Item -LiteralPath (Join-Path $Root ('.local/' + $proofPair[0])) `
            -Destination (Join-Path $proofTarget $proofPair[1])
    }
}
