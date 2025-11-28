# Script PowerShell para criar uma nova versão com tag
# Uso: .\criar-versao.ps1 -versao "1.0.0" -mensagem "Descrição da versão"

param(
    [Parameter(Mandatory=$true)]
    [string]$versao,
    
    [Parameter(Mandatory=$true)]
    [string]$mensagem
)

Write-Host "🚀 Criando nova versão v$versao..." -ForegroundColor Cyan

# Verificar se há mudanças não commitadas
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Adicionando arquivos modificados..." -ForegroundColor Yellow
    git add .
    
    Write-Host "💾 Criando commit..." -ForegroundColor Yellow
    git commit -m "Release v$versao - $mensagem"
}

# Criar tag
Write-Host "🏷️  Criando tag v$versao..." -ForegroundColor Yellow
git tag -a "v$versao" -m "$mensagem"

# Push
Write-Host "☁️  Enviando para repositório remoto..." -ForegroundColor Yellow
git push
git push origin "v$versao"

Write-Host "✅ Versão v$versao criada com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Para ver todas as versões: git tag -l" -ForegroundColor Cyan
Write-Host "Para voltar para esta versão: git checkout v$versao" -ForegroundColor Cyan
