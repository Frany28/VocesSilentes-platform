param([Parameter(Mandatory = $true)][string]$Path)
$ErrorActionPreference = 'Stop'
$resolvedPdf = (Resolve-Path -LiteralPath $Path).Path
$expectedHash = '9B03921E8719CD341C44B8CCAD730E52A9DB46DA29EB8F5058F5B63A7D033139'
if ((Get-FileHash -LiteralPath $resolvedPdf -Algorithm SHA256).Hash -ne $expectedHash) {
  throw 'El PDF no corresponde al documento revisado; se detiene la extracción.'
}
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$storageType = [Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]
$pdfType = [Windows.Data.Pdf.PdfDocument,Windows.Data.Pdf,ContentType=WindowsRuntime]
$streamType = [Windows.Storage.Streams.InMemoryRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime]
$readerType = [Windows.Storage.Streams.DataReader,Windows.Storage.Streams,ContentType=WindowsRuntime]
$optionsType = [Windows.Data.Pdf.PdfPageRenderOptions,Windows.Data.Pdf,ContentType=WindowsRuntime]
$genericTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and
  $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
} | Select-Object -First 1
function Complete-Operation($operation, $type) {
  $task = $genericTask.MakeGenericMethod($type).Invoke($null, @($operation))
  $task.Wait()
  $task.Result
}
$file = Complete-Operation ($storageType::GetFileFromPathAsync($resolvedPdf)) $storageType
$pdf = Complete-Operation ($pdfType::LoadFromFileAsync($file)) $pdfType
$destination = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../../.local/manual-lsv-review'))
New-Item -ItemType Directory -Force -Path $destination | Out-Null
foreach ($number in @(5,6)) {
  $page = $pdf.GetPage($number - 1)
  $stream = New-Object $streamType
  $options = New-Object $optionsType
  $options.DestinationWidth = 794
  $action = $page.RenderToStreamAsync($stream, $options)
  $actionMethod = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and -not $_.IsGenericMethod -and $_.GetParameters().Count -eq 1
  } | Select-Object -First 1
  $actionMethod.Invoke($null, @($action)).Wait()
  $stream.Seek(0)
  $reader = New-Object $readerType ($stream.GetInputStreamAt(0))
  $null = Complete-Operation ($reader.LoadAsync([uint32]$stream.Size)) ([uint32])
  $bytes = New-Object byte[] $stream.Size
  $reader.ReadBytes($bytes)
  [System.IO.File]::WriteAllBytes((Join-Path $destination "page-$number.png"), $bytes)
  $reader.Dispose()
  $stream.Dispose()
  $page.Dispose()
}
Write-Output 'Páginas 5 y 6 renderizadas localmente. Ejecuta node Backend/scripts/learning/extract-manual-images.js.'
