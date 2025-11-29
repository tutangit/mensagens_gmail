# 📦 Controle de Versão - Guia Rápido

## 🚀 Comandos Mais Usados

### Salvar uma nova versão
```powershell
# Método 1: Usando o script (RECOMENDADO)
.\.git-scripts\criar-versao.ps1 -versao "1.1.0" -mensagem "Descrição das mudanças"

# Método 2: Manual
git add .
git commit -m "Descrição das mudanças"
git push
```

### Criar backup antes de mudança arriscada
```powershell
.\.git-scripts\backup-atual.ps1 -nome "antes-de-mudanca-importante"
```

### Ver todas as versões
```powershell
.\.git-scripts\listar-versoes.ps1
```

### Voltar para uma versão anterior
```powershell
# Ver versões disponíveis
git tag -l

# Voltar temporariamente (apenas visualizar)
git checkout v1.0.0

# Voltar para a versão mais recente
git checkout main

# Voltar permanentemente (CUIDADO!)
git reset --hard v1.0.0
```

---

## 📚 Documentação Completa

Para guia detalhado, consulte: **[VERSIONING.md](./VERSIONING.md)**

Para informações sobre os scripts: **[.git-scripts/README.md](./.git-scripts/README.md)**

---

## 🏷️ Versões do Projeto

- **v1.0.0** - Sistema de email com OAuth Gmail e criptografia de tokens

---

## 💡 Dica Importante

**Sempre crie um backup antes de fazer mudanças arriscadas!**

```powershell
.\.git-scripts\backup-atual.ps1 -nome "pre-mudanca-arriscada"
```
