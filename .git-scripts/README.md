# 🛠️ Scripts Git Úteis

Esta pasta contém scripts PowerShell para facilitar o gerenciamento de versões do projeto.

## 📜 Scripts Disponíveis

### 1. criar-versao.ps1
Cria uma nova versão do projeto com tag Git.

**Uso:**
```powershell
.\.git-scripts\criar-versao.ps1 -versao "1.0.0" -mensagem "Primeira versão estável"
```

**O que faz:**
- Adiciona todos os arquivos modificados
- Cria um commit
- Cria uma tag com a versão
- Envia tudo para o repositório remoto

---

### 2. listar-versoes.ps1
Lista todas as versões (tags) do projeto.

**Uso:**
```powershell
.\.git-scripts\listar-versoes.ps1
```

**O que faz:**
- Mostra todas as tags criadas
- Exibe as mensagens de cada versão
- Fornece dicas de uso

---

### 3. backup-atual.ps1
Cria um backup rápido da versão atual com timestamp.

**Uso:**
```powershell
.\.git-scripts\backup-atual.ps1 -nome "antes-de-mudanca-arriscada"
```

**O que faz:**
- Cria uma tag de backup com data/hora
- Pergunta se quer commitar mudanças pendentes
- Facilita recuperação posterior

**Exemplo de tag criada:**
```
backup/antes-de-mudanca-arriscada-2025-11-28-2030
```

---

## 🚀 Como Usar

1. **Abra o PowerShell** na pasta do projeto
2. **Execute o script desejado** com os parâmetros necessários

### Exemplo Completo de Workflow

```powershell
# 1. Criar backup antes de mudança importante
.\.git-scripts\backup-atual.ps1 -nome "pre-migracao-db"

# 2. Fazer suas modificações no código
# ...

# 3. Criar nova versão
.\.git-scripts\criar-versao.ps1 -versao "1.1.0" -mensagem "Migração do banco de dados"

# 4. Listar todas as versões
.\.git-scripts\listar-versoes.ps1
```

---

## 💡 Dicas

- **Use nomes descritivos** para backups e versões
- **Crie backups antes de mudanças arriscadas**
- **Siga versionamento semântico** (Major.Minor.Patch)
- **Documente bem suas versões** nas mensagens

---

## 🔒 Permissões

Se encontrar erro de execução, habilite scripts PowerShell:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📚 Mais Informações

Consulte o arquivo `VERSIONING.md` na raiz do projeto para um guia completo sobre controle de versão.
