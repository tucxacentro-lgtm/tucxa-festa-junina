$projectRoot = "C:\Users\lacos\Documents\Github\tucxa-festa-junina"
$zipName = "tucxa-ajustes-publico-cardapio-simulacao.zip"
$zipPath = Join-Path $projectRoot $zipName

$files = @(
    "src\app\cardapio\[eventSlug]\page.tsx",
    "src\app\festa-junina\page.tsx",
    "src\app\admin\festa-junina\simulacao\capacidade\page.tsx",
    "src\app\admin\festa-junina\simulacao\capacidade\actions.ts",
    "src\app\api\admin\festa-junina\simulacao\capacidade\pdf\route.ts",

    "src\components\cardapio\public-cardapio-header.tsx",
    "src\components\cardapio\public-order-form.tsx",
    "src\components\cardapio\public-cardapio-page.tsx",

    "src\components\festa-junina\welcome-modal.tsx",
    "src\components\festa-junina\first-visit-modal.tsx",
    "src\components\festa-junina\public-welcome-dialog.tsx",
    "src\components\festa-junina\onboarding-modal.tsx",

    "src\lib\festa-junina-public-content.ts",
    "src\lib\public-content.ts",
    "src\lib\simulacao-capacidade.ts",
    "src\lib\simulacao-capacidade-pdf.ts",

    "src\components\simulacao\scenario-pdf.tsx",
    "src\components\simulacao\scenario-summary.tsx"
)

$tempDir = Join-Path $projectRoot "_zip_temp_publico_simulacao"

if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

New-Item -ItemType Directory -Path $tempDir | Out-Null

$included = @()

foreach ($relativePath in $files) {
    $sourcePath = Join-Path $projectRoot $relativePath
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $tempDir $relativePath
        $destFolder = Split-Path $destPath -Parent
        if (!(Test-Path $destFolder)) {
            New-Item -ItemType Directory -Path $destFolder -Force | Out-Null
        }
        Copy-Item $sourcePath $destPath -Force
        $included += $relativePath
    }
}

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $zipPath

Write-Host ""
Write-Host "ZIP gerado com sucesso em:"
Write-Host $zipPath
Write-Host ""
Write-Host "Arquivos incluídos:"
$included | ForEach-Object { Write-Host " - $_" }

Remove-Item $tempDir -Recurse -Force