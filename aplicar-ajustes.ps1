$ErrorActionPreference = "Stop"

Write-Host "Aplicando ajustes na raiz do projeto..." -ForegroundColor Cyan

$files = @(
  "src\components\ticket-order-form.tsx",
  "src\components\public-sales-menu.tsx",
  "src\lib\operation-dashboard.ts",
  "src\app\gestao-evento\caixa\page.tsx",
  "src\app\gestao-evento\actions.ts"
)

foreach ($file in $files) {
  if (-not (Test-Path $file)) {
    Write-Host "Atenção: $file não existe ainda no destino. Ele será criado." -ForegroundColor Yellow
  }
}

Write-Host "Copie o conteúdo deste zip por cima da raiz do projeto mantendo as pastas src/..." -ForegroundColor Green
Write-Host "Depois rode: npm run lint e npm run build" -ForegroundColor Green
