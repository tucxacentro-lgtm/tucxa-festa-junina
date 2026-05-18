$ErrorActionPreference = "Stop"

$repo = "C:\Users\lacos\Documents\Github\tucxa-festa-junina"
$outDir = Join-Path $repo "_zip_temp_ajustes"
$zipFile = Join-Path $repo "tucxa-ajustes-garcom-caixa-cardapio-2026.zip"

if (Test-Path $outDir) {
    Remove-Item $outDir -Recurse -Force
}
New-Item -ItemType Directory -Path $outDir | Out-Null

$items = @(
    "src\app\gestao-evento\page.tsx",
    "src\app\gestao-evento\garcom\page.tsx",
    "src\app\gestao-evento\caixa\page.tsx",
    "src\app\gestao-evento\actions.ts",
    "src\app\gestao-evento\garcom\actions.ts",
    "src\app\gestao-evento\caixa\actions.ts",
    "src\app\cardapio\[eventSlug]\page.tsx",
    "src\app\cardapio\[eventSlug]\pedido\[orderId]\page.tsx",
    "src\app\admin\festa-junina\page.tsx",
    "src\app\admin\festa-junina\menu\page.tsx",
    "src\app\admin\festa-junina\menu\actions.ts",
    "src\lib\operation-dashboard.ts",
    "src\lib\admin-menu.ts",
    "src\lib\menu-routes.ts",
    "src\lib\help-content.ts",
    "src\lib\menu-data.ts",
    "src\lib\catalog-data.ts",
    "src\lib\event-menu.ts",
    "src\types",
    "supabase\migrations"
)

foreach ($item in $items) {
    $source = Join-Path $repo $item
    if (Test-Path $source) {
        $dest = Join-Path $outDir $item
        $destParent = Split-Path $dest -Parent
        if (!(Test-Path $destParent)) {
            New-Item -ItemType Directory -Path $destParent -Force | Out-Null
        }

        $isDirectory = (Get-Item $source).PSIsContainer
        if ($isDirectory) {
            Copy-Item $source $dest -Recurse -Force
        } else {
            Copy-Item $source $dest -Force
        }
    } else {
        Write-Host "Aviso: não encontrado -> $item"
    }
}

if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

Compress-Archive -Path (Join-Path $outDir "*") -DestinationPath $zipFile -Force

Write-Host ""
Write-Host "ZIP gerado com sucesso em:"
Write-Host $zipFile