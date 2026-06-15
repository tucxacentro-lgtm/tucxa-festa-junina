$ErrorActionPreference = "Stop"

$files = @(
  "src/lib/operation-dashboard.ts",
  "src/app/admin/festa-junina/prestacao-contas/page.tsx",
  "src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts",
  "src/app/admin/festa-junina/prestacao-contas/gerar-pdf/route.ts"
)

Write-Host "Arquivos esperados no pacote:" -ForegroundColor Green
foreach ($file in $files) {
  if (Test-Path $file) {
    Write-Host "OK  $file" -ForegroundColor Green
  } else {
    Write-Host "ERRO: arquivo não encontrado: $file" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "Depois rode:" -ForegroundColor Yellow
Write-Host "npm run lint"
Write-Host "npm run build"
