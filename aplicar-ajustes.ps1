$ErrorActionPreference = "Stop"

$source = Join-Path $PSScriptRoot "src\app\gestao-evento\garcom\page.tsx"
$target = Join-Path (Get-Location) "src\app\gestao-evento\garcom\page.tsx"

if (!(Test-Path $source)) {
  throw "Arquivo de origem não encontrado: $source"
}

$targetDir = Split-Path $target -Parent
if (!(Test-Path $targetDir)) {
  New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

Copy-Item $source $target -Force
Write-Host "Arquivo atualizado: $target"
Write-Host "Agora rode: npm run lint && npm run build"
