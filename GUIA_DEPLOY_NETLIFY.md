# Guia de Deploy no Netlify + Backend Separado

## Problema Atual
O Netlify é um serviço para hospedar **apenas o frontend (HTML, CSS, JS)**. Seu backend (Node.js com Express) precisa estar em um servidor separado.

## Arquitetura Recomendada

```
┌─────────────────────────────────────────┐
│         Netlify (Frontend)              │
│  - Todos os arquivos da pasta /Front    │
│  - Aponta para API remota               │
└─────────────────────────────────────────┘
                    ↓ (chamadas API)
┌─────────────────────────────────────────┐
│      Render/Railway/Heroku (Backend)    │
│  - Node.js + Express server             │
│  - Banco de dados SQLite (ou MongoDB)   │
│  - seed.js executado uma única vez      │
└─────────────────────────────────────────┘
```

## Passo 1: Deploy do Backend (escolha uma opção)

### Opção A: Render (Recomendado - Gratuito)
1. Vá para https://render.com
2. Faça login com GitHub
3. Clique em "New +" → "Web Service"
4. Conecte seu repositório GitHub
5. Configure:
   - **Name**: `techtak-api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Adicione variáveis de ambiente:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `FRONTEND_ORIGIN=https://seu-site-netlify.netlify.app`
7. Deploy!
8. Copie a URL que aparecerá (ex: `https://techtak-api.onrender.com`)

### Opção B: Railway
1. Vá para https://railway.app
2. Clique em "Deploy from GitHub"
3. Selecione o repositório
4. Configure as mesmas variáveis de ambiente
5. Railway detecará automaticamente que é Node.js

### Opção C: Heroku (menos recomendado, agora pago)
Deixei de ser gratuito em 2022.

## Passo 2: Preparar o Backend para Produção

No arquivo `Back/server.js`, adicione:

```javascript
// No topo do arquivo, após os requires
const isProduction = process.env.NODE_ENV === 'production';

// Quando configurar CORS
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true
}));

// Para servir o frontend em produção (opcional)
if (isProduction) {
    app.use(express.static(path.join(__dirname, "..", "Front")));
}
```

## Passo 3: Atualizar o Frontend para API Remota

No arquivo `Front/config.js`, altere:

```javascript
// ANTES (desenvolvimento local)
const API_BASE_URL = "http://localhost:3000";

// DEPOIS (produção)
const LOCAL_API_BASE_URL = "http://localhost:3000";
const PROD_API_BASE_URL = "https://seu-backend.onrender.com"; // ← Coloque a URL do Render/Railway
const API_BASE_URL = window.location.hostname === "localhost" ? LOCAL_API_BASE_URL : PROD_API_BASE_URL;
```

## Passo 4: Deploy do Frontend no Netlify

1. Vá para https://netlify.com
2. Faça login com GitHub
3. Clique em "Add new site" → "Import an existing project"
4. Selecione seu repositório
5. Configure:
   - **Base directory**: `Front`
   - **Build command**: (deixe em branco)
   - **Publish directory**: `Front`
6. Clique em "Deploy site"

## Passo 5: Executar o Seed Uma Única Vez

Depois que o backend estiver online, execute uma **única vez**:

```bash
cd Back
node seed.js
```

Isso populará o banco de dados SQLite. Não precisa executar novamente a menos que queira resetar os dados.

## Testar a Conexão

1. Abra seu site no Netlify
2. Abra o console do navegador (F12)
3. Tente fazer login - deve conectar à API remota
4. Verifique se os dados são carregados

## Problemas Comuns

### "CORS error: Access denied"
**Solução**: Verifique se a variável `FRONTEND_ORIGIN` no backend está correta:
```
FRONTEND_ORIGIN=https://seu-site.netlify.app
```

### "Cannot GET /api/..."
**Solução**: O backend não está rodando. Verifique em Render/Railway se está online.

### "Conexão recusada localhost:3000"
**Solução**: Você pode estar em modo desenvolvimento. Em produção, a URL deve ser a do Render/Railway.

## Links Úteis

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Netlify Documentation](https://docs.netlify.com)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## Próximos Passos

1. ✅ Deploy do Backend (Render/Railway)
2. ✅ Atualizar `config.js` com URL da API
3. ✅ Deploy do Frontend (Netlify)
4. ✅ Executar `seed.js` uma vez
5. ✅ Testar tudo funcionando

Boa sorte! 🚀
