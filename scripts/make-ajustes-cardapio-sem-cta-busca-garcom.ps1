$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\Users\lacos\Documents\Github\tucxa-festa-junina"
$OutputDir = Join-Path $ProjectRoot "_review"
$ZipPath = Join-Path $OutputDir "tucxa-ajustes-cardapio-sem-cta-busca-garcom.zip"

if (Test-Path $OutputDir) {
  Remove-Item $OutputDir -Recurse -Force
}

New-Item -ItemType Directory -Path $OutputDir | Out-Null

$TempRoot = Join-Path $env:TEMP ("tucxa-ajustes-cardapio-sem-cta-" + [guid]::NewGuid().ToString())
$TempDir = Join-Path $TempRoot "tucxa-festa-junina"

New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

$ItemsToCopy = @(
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "tsconfig.json",
  "eslint.config.mjs",
  "postcss.config.mjs",

  "src\app\cardapio\[eventSlug]\page.tsx",
  "src\components\public-menu-browser.tsx",
  "src\lib\menu-images.ts",

  "src\app\gestao-evento\garcom\page.tsx",
  "src\app\gestao-evento\actions.ts",
  "src\lib\operation-dashboard.ts",

  "src\lib\format.ts",
  "src\lib\current-event.ts",
  "src\lib\supabaseServer.ts",

  "src\types"
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
  } else {
    Write-Host "Aviso: não encontrado -> $Item"
  }
}

$ForbiddenDirs = @(
  "node_modules",
  ".next",
  ".vercel",
  ".git",
  "_review"
)

foreach ($DirName in $ForbiddenDirs) {
  Get-ChildItem $TempDir -Directory -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -eq $DirName } |
    Remove-Item -Recurse -Force
}

$ForbiddenFiles = @(
  ".env",
  ".env.local",
  ".env.production",
  ".env.development"
)

foreach ($FileName in $ForbiddenFiles) {
  Get-ChildItem $TempDir -File -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -eq $FileName } |
    Remove-Item -Force
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