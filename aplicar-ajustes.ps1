$ErrorActionPreference = "Stop"

Write-Host "Aplicando ajustes do relatório final, PDF e bloqueio de edição..." -ForegroundColor Green

$files = @(
  "src/app/gestao-evento/caixa/page.tsx",
  "src/app/gestao-evento/actions.ts",
  "src/app/admin/festa-junina/prestacao-contas/page.tsx",
  "src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts",
  "src/app/admin/festa-junina/prestacao-contas/gerar-pdf/route.ts",
  "src/lib/operation-dashboard.ts"
)

foreach ($file in $files) {
  if (-not (Test-Path $file)) {
    Write-Host "Atenção: arquivo ainda não encontrado após extração: $file" -ForegroundColor Yellow
  } else {
    Write-Host "OK: $file" -ForegroundColor Green
  }
}

Write-Host "\nAgora rode:" -ForegroundColor Cyan
Write-Host "npm run lint"
Write-Host "npm run build"
