# Selección explícita de código y documentación necesaria para instalar, ejecutar y verificar.
function Write-ModuleText([string]$Path, [string]$Text) {
    [IO.File]::WriteAllText($Path, $Text, [Text.UTF8Encoding]::new($false))
}
function Copy-ModuleSource([string]$Root, [string]$Target) {
    $sourceRootFiles = @('package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', '.npmrc', '.nvmrc',
        '.node-version', '.editorconfig', '.gitignore', '.prettierrc.json', '.prettierignore',
        'eslint.config.js', 'netlify.toml', '.vercelignore')
    $sourceFiles = @(git -C $Root -c core.quotepath=false ls-files --cached --others --exclude-standard) |
        Sort-Object -Unique | Where-Object {
            ($_ -in $sourceRootFiles -or $_ -match '^(Frontend|Backend)/') -and
            $_ -notmatch '(^|/)(node_modules|generated|dist|coverage|\.vercel|\.local|\.git)/' -and
            $_ -notmatch '(^|/)(AGENTS?\.md|SKILL\.md|CLAUDE\.md|\.agents|\.codex|\.cursor)(/|$)' -and
            $_ -notmatch '^Frontend/(src/(assets/Logos|dev)/|ui\.html$|admin-review\.html$)' -and
            ($_ -notmatch '(^|/)\.env($|\.)' -or $_ -match '(^|/)\.env\.example$') -and
            $_ -notmatch '\.(zip|log)$' -and
            $_ -notmatch '^Backend/scripts/verify-module-ii-package\.js$'
        }
    foreach ($sourceFile in $sourceFiles) {
        $sourceInput = Join-Path $Root $sourceFile
        if (-not (Test-Path -LiteralPath $sourceInput -PathType Leaf)) { continue }
        $sourceOutput = Join-Path $Target $sourceFile
        New-Item -ItemType Directory -Path (Split-Path -Parent $sourceOutput) -Force | Out-Null
        Copy-Item -LiteralPath $sourceInput -Destination $sourceOutput
    }
    $sourceDocuments = @{
        'project-readme.md' = 'README.md'; 'development.md' = 'docs/development.md'
        'architecture.md' = 'docs/architecture.md'; 'api.md' = 'docs/api.md'
    }
    foreach ($sourceDocument in $sourceDocuments.Keys) {
        $sourceOutput = Join-Path $Target $sourceDocuments[$sourceDocument]
        New-Item -ItemType Directory -Path (Split-Path -Parent $sourceOutput) -Force | Out-Null
        Copy-Item -LiteralPath (Join-Path $Root ('docs/module-ii/package/' + $sourceDocument)) -Destination $sourceOutput
    }
    $sourceSql = Join-Path $Target 'docs/module-ii/sql'
    New-Item -ItemType Directory -Path $sourceSql -Force | Out-Null
    Get-ChildItem -LiteralPath (Join-Path $Root 'docs/module-ii/sql') -Filter '*.sql' -File |
        ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $sourceSql }
    $sourceManifestPath = Join-Path $Target 'package.json'
    $sourcePackageScript = @'
const fs = require('node:fs');
const path = process.argv[1];
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
delete data.scripts['academic:package'];
fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
'@
    & node -e $sourcePackageScript $sourceManifestPath
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo preparar el manifiesto de la entrega' }
    $sourceIgnore = [IO.File]::ReadAllText((Join-Path $Target '.gitignore'))
    $sourceIgnore = ($sourceIgnore -split '\r?\n' | Where-Object { $_ -notmatch 'AGENTS|entrega-modulo-ii|modulo-ii-' }) -join "`n"
    Write-ModuleText (Join-Path $Target '.gitignore') $sourceIgnore
    # Las galerías excluidas no participan en las fuentes de Tailwind del proyecto entregado.
    $sourceCssPath = Join-Path $Target 'Frontend/src/styles/global.css'
    $sourceCss = [IO.File]::ReadAllText($sourceCssPath)
    $sourceCss = ($sourceCss -split '\r?\n' | Where-Object { $_ -notin @("@source '../dev';", "@source '../../ui.html';") }) -join "`n"
    Write-ModuleText $sourceCssPath $sourceCss
}
