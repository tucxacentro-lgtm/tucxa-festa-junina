$ErrorActionPreference = "Stop"

Write-Host "Aplicando ajustes pós-evento..." -ForegroundColor Green

$files = @(
  "src/app/gestao-evento/caixa/page.tsx",
  "src/app/gestao-evento/actions.ts",
  "src/app/admin/festa-junina/prestacao-contas/page.tsx",
  "src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts",
  "src/lib/operation-dashboard.ts"
)

foreach ($file in $files) {
  if (-not (Test-Path $file)) {
    Write-Host "Aviso: arquivo ainda não encontrado na raiz atual: $file" -ForegroundColor Yellow
  } else {
    Write-Host "OK: $file" -ForegroundColor Cyan
  }
}

Write-Host "\nAgora rode:" -ForegroundColor Green
Write-Host "npm run lint"
Write-Host "npm run build"
