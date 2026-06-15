$ErrorActionPreference = "Stop"

Write-Host "Aplicando ajustes de prestação de contas..." -ForegroundColor Green

$files = @(
  "src/lib/operation-dashboard.ts",
  "src/app/admin/festa-junina/prestacao-contas/page.tsx",
  "src/app/admin/festa-junina/prestacao-contas/actions.ts",
  "src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts",
  "src/app/admin/festa-junina/prestacao-contas/gerar-pdf/route.ts",
  "supabase/sql/032_event_accounting_entries.sql"
)

foreach ($file in $files) {
  if (Test-Path $file) {
    Write-Host "OK: $file" -ForegroundColor DarkGreen
  } else {
    Write-Host "ATENÇÃO: arquivo não encontrado após extração: $file" -ForegroundColor Yellow
  }
}

Write-Host "\nAgora rode no Supabase o SQL: supabase/sql/032_event_accounting_entries.sql" -ForegroundColor Yellow
Write-Host "Depois valide com: npm run lint ; npm run build" -ForegroundColor Green
