$ErrorActionPreference = "Stop"

Write-Host "Aplicando ajustes de relatório e duplicidade..." -ForegroundColor Green

$files = @(
  "src/lib/operation-dashboard.ts",
  "src/app/admin/festa-junina/prestacao-contas/page.tsx",
  "src/app/admin/festa-junina/prestacao-contas/gerar-pdf/route.ts",
  "src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts",
  "src/components/public-sales-menu.tsx",
  "src/app/admin/festa-junina/cliente-resumo/actions.ts"
)

foreach ($file in $files) {
  if (Test-Path $file) {
    Write-Host "OK: $file" -ForegroundColor Cyan
  } else {
    Write-Host "ATENÇÃO: arquivo não encontrado após extração: $file" -ForegroundColor Yellow
  }
}

Write-Host "\nAgora rode:" -ForegroundColor Green
Write-Host "npm run lint"
Write-Host "npm run build"
