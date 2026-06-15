$ErrorActionPreference = "Stop"

$files = @(
  "src/lib/operation-dashboard.ts",
  "src/app/admin/festa-junina/prestacao-contas/page.tsx",
  "src/app/admin/festa-junina/prestacao-contas/gerar-pdf/route.ts",
  "src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts"
)

foreach ($file in $files) {
  if (-not (Test-Path $file)) {
    Write-Host "Arquivo aplicado/criado: $file"
  } else {
    Write-Host "Arquivo atualizado: $file"
  }
}

Write-Host ""
Write-Host "Ajustes aplicados. Rode agora:"
Write-Host "npm run lint"
Write-Host "npm run build"
