# 🚀 Guia de Deploy - GitHub + Vercel

## ✅ Passo 1: Preparação Concluída

O repositório Git foi inicializado e está pronto para ser enviado ao GitHub.

## 📤 Passo 2: Enviar para o GitHub

### Opção A: Usando GitHub Desktop (Recomendado)
1. Abra o **GitHub Desktop**
2. Clique em **File → Add Local Repository**
3. Selecione a pasta: `C:\Users\luan_\Documents\desenvolvimento_CRIATIVO`
4. Clique em **Publish repository**
5. Confirme o nome: `mensagens_gmail`
6. Clique em **Publish**

### Opção B: Linha de Comando (necessita autenticação)
```bash
# Configure suas credenciais do GitHub (apenas primeira vez)
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Faça o push
git push -u origin main
```

**Nota:** Se pedir senha, use um **Personal Access Token** em vez da senha:
1. Vá em: https://github.com/settings/tokens
2. Clique em **Generate new token (classic)**
3. Marque: `repo` (acesso completo)
4. Copie o token e use como senha

## 🌐 Passo 3: Deploy na Vercel

### 3.1 Conectar o Repositório
1. Acesse: https://vercel.com/new
2. Clique em **Import Git Repository**
3. Selecione: `tutangit/mensagens_gmail`
4. Clique em **Import**

### 3.2 Configurar Variáveis de Ambiente
Na tela de configuração, adicione as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://hjlfxjgdzzjnxjaoabof.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbGZ4amdkenpqbnhqYW9hYm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTY4MTIsImV4cCI6MjA3OTc5MjgxMn0.taR_b4J9StSWiQjGa5OLqtkPwpXvYyvvc--FMuqjhvc
VITE_GMAIL_CLIENT_ID=200508590950-28n23sdmlmrkjhtm3ucln10p1377lhql.apps.googleusercontent.com
```

### 3.3 Configurações de Build
- **Framework Preset:** Vite
- **Build Command:** `npm run build` (já configurado)
- **Output Directory:** `dist` (já configurado)
- **Install Command:** `npm install` (padrão)

### 3.4 Deploy
1. Clique em **Deploy**
2. Aguarde o build (1-2 minutos)
3. Seu app estará disponível em: `https://mensagens-gmail.vercel.app`

## 🔧 Passo 4: Configurar Google OAuth para Produção

1. Acesse: https://console.cloud.google.com/
2. Vá em **APIs & Services → Credentials**
3. Edite o OAuth 2.0 Client ID
4. Em **Authorized redirect URIs**, adicione:
   ```
   https://mensagens-gmail.vercel.app
   ```
5. Salve as alterações

## 🔒 Passo 5: Atualizar CORS no Supabase

O arquivo `cors.ts` já está configurado para aceitar:
- `http://localhost:5173` (desenvolvimento)
- `https://mensagens-gmail.vercel.app` (produção)

Se você usar um domínio customizado, edite o arquivo:
```typescript
const allowedOrigins = [
    'http://localhost:5173',
    'https://mensagens-gmail.vercel.app',
    'https://seu-dominio-customizado.com', // Adicione aqui
]
```

## ✅ Checklist Final

- [ ] Código enviado para o GitHub
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Build concluído com sucesso
- [ ] Google OAuth configurado para produção
- [ ] Testado login e envio de email em produção

## 🐛 Troubleshooting

### Erro: "CORS policy"
- Verifique se o domínio está em `allowedOrigins` no `cors.ts`
- Faça um novo commit e push após alterar

### Erro: "Gmail API not enabled"
- Habilite a Gmail API no Google Cloud Console
- Aguarde 5-10 minutos para propagar

### Erro: "Unauthorized redirect_uri"
- Adicione a URL da Vercel nas URIs autorizadas do Google OAuth
- Use exatamente: `https://mensagens-gmail.vercel.app` (sem barra no final)

## 📝 Próximos Passos (Opcional)

### Domínio Customizado
1. Na Vercel, vá em **Settings → Domains**
2. Adicione seu domínio
3. Configure os DNS conforme instruções
4. Atualize o `cors.ts` com o novo domínio

### Monitoramento
- Vercel Analytics: Já habilitado automaticamente
- Supabase Logs: https://supabase.com/dashboard/project/hjlfxjgdzzjnxjaoabof/logs

### Melhorias Futuras
- [ ] Adicionar rate limiting
- [ ] Implementar 2FA
- [ ] Adicionar testes automatizados
- [ ] Configurar CI/CD com GitHub Actions

---

## 🎉 Parabéns!

Seu app está pronto para produção com:
- ✅ Segurança reforçada (tokens criptografados, RLS, CORS)
- ✅ Deploy automático (push → build → deploy)
- ✅ Escalabilidade (Vercel Edge + Supabase)

**URL do Projeto:** https://mensagens-gmail.vercel.app
**Repositório:** https://github.com/tutangit/mensagens_gmail
