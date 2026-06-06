$ErrorActionPreference = "Stop"

$arquivos = @(
  "src/app/gestao-evento/caixa/page.tsx",
  "src/app/gestao-evento/actions.ts",
  "src/app/admin/login/page.tsx",
  "src/app/admin/login/admin-login-form.tsx",
  "src/app/admin/festa-junina/atendimento/cancelados/page.tsx",
  "src/app/admin/festa-junina/atendimento/cancelados/actions.ts",
  "src/app/admin/festa-junina/prestacao-contas/page.tsx",
  "src/app/admin/festa-junina/prestacao-contas/exportar-pedidos/route.ts",
  "supabase/031_limpeza_pedidos_cancelados_teste.sql"
)

Write-Host "Arquivos esperados neste pacote:" -ForegroundColor Cyan
foreach ($arquivo in $arquivos) {
  if (Test-Path $arquivo) {
    Write-Host "OK  $arquivo" -ForegroundColor Green
  } else {
    Write-Host "ATENCAO  $arquivo nao encontrado" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Cyan
Write-Host "npm run lint"
Write-Host "npm run build"
