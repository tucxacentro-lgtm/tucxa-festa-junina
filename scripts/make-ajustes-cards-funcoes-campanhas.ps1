$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\Users\lacos\Documents\Github\tucxa-festa-junina"
$OutputDir = Join-Path $ProjectRoot "_review"
$ZipPath = Join-Path $OutputDir "tucxa-ajustes-cards-funcoes-campanhas.zip"

if (Test-Path $OutputDir) {
  Remove-Item $OutputDir -Recurse -Force
}

New-Item -ItemType Directory -Path $OutputDir | Out-Null

$TempRoot = Join-Path $env:TEMP ("tucxa-ajustes-" + [guid]::NewGuid().ToString())
$TempDir = Join-Path $TempRoot "tucxa-festa-junina"

New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

$ItemsToCopy = @(
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "eslint.config.mjs",
  "next.config.ts",
  "postcss.config.mjs",

  "src\app\cardapio\[eventSlug]\page.tsx",
  "src\components\public-sales-menu.tsx",
  "src\components\cardapio",

  "src\app\admin\festa-junina\voluntarios\funcoes\page.tsx",
  "src\app\admin\festa-junina\voluntarios\funcoes\actions.ts",

  "src\app\admin\festa-junina\indicacoes\page.tsx",
  "src\app\admin\festa-junina\indicacoes\actions.ts",

  "src\lib\event-volunteers.ts",
  "src\lib\volunteer-functions.ts",
  "src\lib\current-event.ts",
  "src\lib\supabaseServer.ts",
  "src\lib\auth.ts",
  "src\types\festa-junina.ts",

  "supabase\migrations"
)

$Included = @()

foreach ($Item in $ItemsToCopy) {
  $Source = Join-Path $ProjectRoot $Item

  if (Test-Path $Source) {
    $Destination = Join-Path $TempDir $Item
    $DestinationParent = Split-Path $Destination -Parent

    if (!(Test-Path $DestinationParent)) {
      New-Item -ItemType Directory -Path $DestinationParent -Force | Out-Null
    }

    if ((Get-Item $Source).PSIsContainer) {
      Copy-Item $Source $Destination -Recurse -Force
    } else {
      Copy-Item $Source $Destination -Force
    }

    $Included += $Item
  }
}

Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipPath -Force

Remove-Item $TempRoot -Recurse -Force

Write-Host ""
Write-Host "ZIP gerado com sucesso:"
Write-Host $ZipPath
Write-Host ""
Write-Host "Arquivos incluídos:"
$Included | ForEach-Object { Write-Host " - $_" }
Write-Host ""