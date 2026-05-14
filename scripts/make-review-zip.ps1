$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path "$PSScriptRoot\.."
$OutputDir = Join-Path $ProjectRoot "_review"
$ZipPath = Join-Path $OutputDir "tucxa-festa-junina-review.zip"

if (Test-Path $OutputDir) {
  Remove-Item $OutputDir -Recurse -Force
}

New-Item -ItemType Directory -Path $OutputDir | Out-Null

$TempRoot = Join-Path $env:TEMP ("tucxa-festa-junina-review-" + [guid]::NewGuid().ToString())
$TempDir = Join-Path $TempRoot "tucxa-festa-junina"

New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

$ItemsToCopy = @(
  "package.json",
  "package-lock.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "tsconfig.json",
  "eslint.config.js",
  "eslint.config.mjs",
  "postcss.config.js",
  "postcss.config.mjs",
  "src",
  "public",
  "supabase",
  "scripts"
)

foreach ($Item in $ItemsToCopy) {
  $Source = Join-Path $ProjectRoot $Item

  if (Test-Path $Source) {
    $Destination = Join-Path $TempDir $Item

    if ((Get-Item $Source).PSIsContainer) {
      Copy-Item $Source $Destination -Recurse -Force
    } else {
      $DestinationParent = Split-Path $Destination -Parent

      if (!(Test-Path $DestinationParent)) {
        New-Item -ItemType Directory -Path $DestinationParent -Force | Out-Null
      }

      Copy-Item $Source $Destination -Force
    }
  }
}

$OptionalFiles = @(
  "Tucxa-FestaJunina.xlsx",
  "Tucxa-FestaJunina(1).xlsx"
)

foreach ($Item in $OptionalFiles) {
  $Source = Join-Path $ProjectRoot $Item
  if (Test-Path $Source) {
    Copy-Item $Source (Join-Path $TempDir $Item) -Force
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