$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\lacos\Documents\GitHub\tucxa-festa-junina"
$stageDir = Join-Path $projectRoot "__zip_video_festa_junina"
$zipFile = Join-Path $projectRoot "tucxa-video-festa-junina.zip"

if (Test-Path $stageDir) {
    Remove-Item $stageDir -Recurse -Force
}

if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

New-Item -ItemType Directory -Path $stageDir -Force | Out-Null

$pathsToInclude = @(
    "src",
    "app",
    "components",
    "lib",
    "data",
    "types",
    "public",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "next.config.ts",
    "next.config.js",
    "next.config.mjs",
    "eslint.config.mjs",
    "postcss.config.mjs",
    "tailwind.config.ts",
    "tailwind.config.js"
)

foreach ($relativePath in $pathsToInclude) {
    $sourcePath = Join-Path $projectRoot $relativePath

    if (Test-Path -LiteralPath $sourcePath) {
        $destinationPath = Join-Path $stageDir $relativePath
        $destinationParent = Split-Path $destinationPath -Parent

        if (!(Test-Path $destinationParent)) {
            New-Item -ItemType Directory -Path $destinationParent -Force | Out-Null
        }

        Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Recurse -Force
        Write-Host "Incluído: $relativePath"
    } else {
        Write-Host "Não encontrado (ok): $relativePath"
    }
}

Compress-Archive -Path (Join-Path $stageDir "*") -DestinationPath $zipFile -Force

Write-Host ""
Write-Host "ZIP gerado em:"
Write-Host $zipFile