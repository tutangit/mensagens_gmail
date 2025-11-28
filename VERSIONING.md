# 📦 Guia de Controle de Versão

Este documento explica como usar o sistema de controle de versão Git para gerenciar e recuperar versões anteriores do projeto.

## 🎯 Conceitos Básicos

### O que é um Commit?
Um commit é um "snapshot" (foto) do seu código em um momento específico. Você pode voltar para qualquer commit anterior.

### O que é uma Tag?
Uma tag é um marcador especial para versões importantes (ex: v1.0.0, v2.0.0). Facilita encontrar versões específicas.

### O que é uma Branch?
Uma branch é uma linha de desenvolvimento paralela. Útil para testar novas funcionalidades sem afetar o código principal.

---

## 🚀 Comandos Essenciais

### 1. Salvar uma Nova Versão (Commit)

```bash
# Ver o que foi modificado
git status

# Adicionar todos os arquivos modificados
git add .

# Criar um commit com mensagem descritiva
git commit -m "Descrição das mudanças feitas"

# Enviar para o repositório remoto (GitHub, etc)
git push
```

**Exemplo prático:**
```bash
git add .
git commit -m "Adicionado sistema de criptografia de tokens OAuth"
git push
```

### 2. Criar uma Tag de Versão

```bash
# Criar uma tag para a versão atual
git tag -a v1.0.0 -m "Versão 1.0.0 - Sistema de email funcionando"

# Enviar a tag para o repositório remoto
git push origin v1.0.0

# Ver todas as tags existentes
git tag -l
```

### 3. Ver Histórico de Versões

```bash
# Ver histórico completo
git log

# Ver histórico resumido (mais legível)
git log --oneline --graph --all

# Ver últimos 10 commits
git log -10 --oneline
```

### 4. Recuperar uma Versão Anterior

#### Opção A: Ver código antigo (sem modificar)
```bash
# Ver lista de commits
git log --oneline

# Ver código de um commit específico (substitua HASH pelo código do commit)
git checkout HASH

# Voltar para a versão mais recente
git checkout main
```

#### Opção B: Voltar permanentemente para versão antiga
```bash
# CUIDADO: Isso apaga as mudanças mais recentes!
git reset --hard HASH

# Se quiser manter as mudanças como arquivos não commitados
git reset --soft HASH
```

#### Opção C: Recuperar apenas um arquivo específico
```bash
# Recuperar um arquivo de um commit anterior
git checkout HASH -- caminho/do/arquivo.js
```

#### Opção D: Criar uma nova branch a partir de versão antiga
```bash
# Criar branch a partir de um commit antigo
git checkout -b recuperacao-versao-antiga HASH
```

---

## 🏷️ Sistema de Versionamento Semântico

Use o padrão **vX.Y.Z** para suas tags:

- **X (Major)**: Mudanças grandes que quebram compatibilidade (ex: v1.0.0 → v2.0.0)
- **Y (Minor)**: Novas funcionalidades compatíveis (ex: v1.0.0 → v1.1.0)
- **Z (Patch)**: Correções de bugs (ex: v1.0.0 → v1.0.1)

**Exemplos:**
- `v1.0.0` - Primeira versão estável
- `v1.1.0` - Adicionado sistema de templates
- `v1.1.1` - Corrigido bug no salvamento
- `v2.0.0` - Migração para Supabase (breaking change)

---

## 🌿 Trabalhando com Branches

### Criar uma branch para testar algo novo
```bash
# Criar e mudar para nova branch
git checkout -b feature/nova-funcionalidade

# Fazer suas modificações e commits
git add .
git commit -m "Implementado nova funcionalidade"

# Voltar para a branch principal
git checkout main

# Mesclar as mudanças (se deu certo)
git merge feature/nova-funcionalidade

# Deletar a branch de teste
git branch -d feature/nova-funcionalidade
```

---

## 📋 Workflow Recomendado

### Fluxo Diário de Trabalho

1. **Antes de começar a trabalhar:**
   ```bash
   git pull  # Baixar últimas mudanças
   ```

2. **Durante o desenvolvimento:**
   ```bash
   # Fazer commits frequentes (a cada funcionalidade completa)
   git add .
   git commit -m "Descrição clara do que foi feito"
   ```

3. **Ao finalizar o dia:**
   ```bash
   git push  # Enviar para o repositório remoto
   ```

4. **Ao completar uma versão importante:**
   ```bash
   git tag -a v1.2.0 -m "Versão 1.2.0 - Descrição"
   git push origin v1.2.0
   ```

---

## 🆘 Situações Comuns

### Desfazer último commit (mas manter as mudanças)
```bash
git reset --soft HEAD~1
```

### Desfazer mudanças em um arquivo específico
```bash
git checkout -- caminho/do/arquivo.js
```

### Ver diferenças entre versões
```bash
# Ver o que mudou desde o último commit
git diff

# Ver diferenças entre dois commits
git diff HASH1 HASH2

# Ver diferenças em um arquivo específico
git diff HASH1 HASH2 -- arquivo.js
```

### Recuperar arquivo deletado
```bash
# Encontrar o commit onde o arquivo ainda existia
git log --all --full-history -- caminho/do/arquivo.js

# Recuperar o arquivo
git checkout HASH -- caminho/do/arquivo.js
```

---

## 🔍 Comandos Úteis de Busca

```bash
# Buscar commits por mensagem
git log --grep="palavra-chave"

# Buscar commits por autor
git log --author="seu-nome"

# Buscar commits em um período
git log --since="2025-01-01" --until="2025-01-31"

# Ver quem modificou cada linha de um arquivo
git blame arquivo.js
```

---

## 💡 Dicas Importantes

1. **Faça commits frequentes** - É melhor ter muitos commits pequenos do que poucos grandes
2. **Use mensagens descritivas** - "Corrigido bug" é ruim, "Corrigido erro de validação no formulário de email" é bom
3. **Crie tags para versões importantes** - Facilita muito encontrar versões específicas depois
4. **Use branches para experimentos** - Nunca teste coisas arriscadas direto na branch main
5. **Faça backup no GitHub/GitLab** - Sempre tenha um repositório remoto

---

## 📚 Recursos Adicionais

- [Documentação oficial do Git (PT-BR)](https://git-scm.com/book/pt-br/v2)
- [GitHub Guides](https://guides.github.com/)
- [Visualizador de Git](https://git-school.github.io/visualizing-git/)

---

## 🎓 Exemplos Práticos para Este Projeto

### Cenário 1: Salvar versão antes de mudança arriscada
```bash
# Criar tag de segurança
git tag -a backup-pre-migracao -m "Backup antes de migrar banco de dados"
git push origin backup-pre-migracao

# Se der errado, voltar:
git checkout backup-pre-migracao
```

### Cenário 2: Testar nova funcionalidade
```bash
# Criar branch de teste
git checkout -b test/novo-sistema-auth

# Fazer modificações e testar
# ...

# Se funcionou, mesclar:
git checkout main
git merge test/novo-sistema-auth

# Se não funcionou, apenas deletar:
git checkout main
git branch -D test/novo-sistema-auth
```

### Cenário 3: Recuperar código de ontem
```bash
# Ver commits de ontem
git log --since="yesterday" --oneline

# Voltar para um commit específico
git checkout HASH

# Ou criar branch a partir dele
git checkout -b recuperacao-ontem HASH
```
