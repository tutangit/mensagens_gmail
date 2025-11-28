# Email Builder - Gmail Sender

Sistema completo de criação e envio de emails usando Gmail API e Supabase.

## 🚀 Funcionalidades

- ✅ **Autenticação segura** com Supabase Auth
- ✅ **Email Builder visual** com drag-and-drop
- ✅ **Envio de emails** via Gmail API
- ✅ **Templates salvos** no Supabase
- ✅ **Histórico de envios**
- ✅ **Tokens OAuth criptografados** com pgcrypto
- ✅ **Row Level Security (RLS)** em todas as tabelas

## 🔒 Segurança

- Tokens Gmail criptografados no banco de dados
- RLS habilitado em todas as tabelas
- CORS restrito ao domínio da aplicação
- Autenticação JWT em todas as Edge Functions
- Políticas de acesso por usuário

## 🛠️ Tecnologias

- **Frontend:** Vite + Vanilla JavaScript
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Autenticação:** Supabase Auth
- **Email:** Gmail API (OAuth 2.0)
- **Criptografia:** pgcrypto

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/tutangit/mensagens_gmail.git
cd mensagens_gmail
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (`.env`):
```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_GMAIL_CLIENT_ID=seu_client_id_google
```

4. Execute o projeto:
```bash
npm run dev
```

## 🌐 Deploy na Vercel

1. Conecte o repositório GitHub à Vercel
2. Configure as variáveis de ambiente no painel da Vercel
3. Deploy automático a cada push na branch `main`

## 📝 Variáveis de Ambiente

### Frontend (Vercel)
- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `VITE_GMAIL_CLIENT_ID` - Client ID do Google OAuth

### Edge Functions (Supabase)
- `GMAIL_CLIENT_ID` - Client ID do Google OAuth
- `GMAIL_CLIENT_SECRET` - Client Secret do Google OAuth

## 🏗️ Estrutura do Projeto

```
desenvolvimento_CRIATIVO/
├── index.html              # Página principal
├── main.js                 # Lógica principal da aplicação
├── email-builder.js        # Editor de emails drag-and-drop
├── style.css               # Estilos globais
├── email-builder.css       # Estilos do editor
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── send-email-text/
│   │   ├── send-email-html/
│   │   └── _shared/
│   │       ├── cors.ts
│   │       └── gmail.ts
│   └── migrations/         # Migrações do banco
└── package.json
```

## 🔐 Configuração do Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Habilite a Gmail API
4. Crie credenciais OAuth 2.0
5. Adicione as URIs de redirecionamento autorizadas:
   - `http://localhost:5173` (desenvolvimento)
   - `https://seu-dominio.vercel.app` (produção)

## 📊 Banco de Dados

### Tabelas

- `profiles` - Perfis de usuários
- `gmail_accounts` - Contas Gmail conectadas (tokens criptografados)
- `sent_emails` - Histórico de emails enviados
- `email_templates` - Templates salvos

### Políticas RLS

Todas as tabelas têm políticas que garantem que cada usuário só acessa seus próprios dados:
- `auth.uid() = user_id` para isolamento de dados

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👤 Autor

**Luan**
- GitHub: [@tutangit](https://github.com/tutangit)

## 🙏 Agradecimentos

- Supabase pela infraestrutura
- Google pela Gmail API
- Comunidade open source
