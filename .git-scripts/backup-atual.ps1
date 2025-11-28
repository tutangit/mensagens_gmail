# Script PowerShell para criar um backup rápido da versão atual
# Uso: .\backup-atual.ps1 -nome "antes-de-mudanca-arriscada"

param(
    [Parameter(Mandatory=$true)]
    [string]$nome
)

$data = Get-Date -Format "yyyy-MM-dd-HHmm"
$tagName = "backup/$nome-$data"

Write-Host "💾 Criando backup da versão atual..." -ForegroundColor Cyan

# Verificar se há mudanças não commitadas
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  Atenção: Há mudanças não salvas!" -ForegroundColor Yellow
    Write-Host "Deseja criar um commit antes do backup? (S/N): " -NoNewline -ForegroundColor Yellow
    $resposta = Read-Host
    
    if ($resposta -eq "S" -or $resposta -eq "s") {
        git add .
        git commit -m "Backup: $nome"
    }
}

# Criar tag de backup
git tag -a "$tagName" -m "Backup: $nome (criado em $data)"

Write-Host "✅ Backup criado: $tagName" -ForegroundColor Green
Write-Host ""
Write-Host "Para restaurar este backup:" -ForegroundColor Cyan
Write-Host "  git checkout $tagName" -ForegroundColor White
Write-Host ""
Write-Host "Para ver todos os backups:" -ForegroundColor Cyan
Write-Host "  git tag -l 'backup/*'" -ForegroundColor White
