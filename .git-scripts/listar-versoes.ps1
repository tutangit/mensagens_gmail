# Script PowerShell para listar todas as versões (tags) do projeto
# Uso: .\listar-versoes.ps1

Write-Host "📋 Versões disponíveis do projeto:" -ForegroundColor Cyan
Write-Host ""

# Listar todas as tags com suas mensagens
git tag -l -n9 | ForEach-Object {
    $parts = $_ -split '\s+', 2
    $tag = $parts[0]
    $message = if ($parts.Length -gt 1) { $parts[1] } else { "" }
    
    Write-Host "🏷️  " -NoNewline -ForegroundColor Yellow
    Write-Host "$tag" -NoNewline -ForegroundColor Green
    if ($message) {
        Write-Host " - $message" -ForegroundColor White
    } else {
        Write-Host ""
    }
}

Write-Host ""
Write-Host "💡 Dicas:" -ForegroundColor Cyan
Write-Host "  • Para voltar para uma versão: git checkout v1.0.0" -ForegroundColor Gray
Write-Host "  • Para criar nova versão: .\criar-versao.ps1 -versao '1.1.0' -mensagem 'Nova funcionalidade'" -ForegroundColor Gray
Write-Host "  • Para ver detalhes de uma tag: git show v1.0.0" -ForegroundColor Gray
