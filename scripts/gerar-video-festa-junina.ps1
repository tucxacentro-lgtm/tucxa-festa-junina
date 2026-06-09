$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$pythonScript = Join-Path $PSScriptRoot "generate_festa_junina_tv_video.py"

if (!(Test-Path $pythonScript)) {
  throw "Script Python não encontrado: $pythonScript"
}

Write-Host "Gerando vídeo do cardápio + programação do bingo..." -ForegroundColor Cyan
Push-Location $projectRoot
try {
  python $pythonScript
  Write-Host "Concluído." -ForegroundColor Green
  Write-Host "Arquivos gerados em: public/videos" -ForegroundColor Green
} finally {
  Pop-Location
}
