# 🚀 Guia de Deploy — TechTake Audiovisual

## Arquitetura

```
Netlify  →  /Front  (frontend estático)
Render   →  /Back   (API Node/Express + SQLite)
```

---

## PASSO 1 — Deploy do Backend no Render

1. Acesse [render.com](https://render.com) e crie um **Web Service**
2. Conecte o repositório GitHub
3. Configure:
   - **Name:** `techtake-api` (ou o nome que preferir)
   - **Root Directory:** deixe vazio (raiz do repo)
   - **Build Command:** `cd Back && npm install --build-from-source=sqlite3 && node seed.js`
   - **Start Command:** `npm start`
4. Em **Environment Variables**, adicione:
   | Variável | Valor |
   |---|---|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | Uma chave longa e aleatória (ex: gere em [randomkeygen.com](https://randomkeygen.com)) |
   | `FRONTEND_ORIGIN` | A URL do Netlify (preencha após o Passo 2) |
5. Clique em **Deploy**
6. Anote a URL gerada: `https://techtake-api.onrender.com` (exemplo)

---

## PASSO 2 — Deploy do Frontend no Netlify

1. Acesse [netlify.com](https://netlify.com) e crie um **New site from Git**
2. Conecte o repositório
3. Configure:
   - **Base directory:** `Front`
   - **Publish directory:** `Front`
   - **Build command:** deixar vazio
4. Clique em **Deploy site**
5. Anote a URL gerada: `https://techtake-site.netlify.app` (exemplo)

---

## PASSO 3 — Conectar os dois

### No arquivo `Front/config.js`, altere a linha:
```js
const PROD_API_BASE_URL = "https://SEU-BACKEND.onrender.com";
```
Para a URL real do seu Render, ex:
```js
const PROD_API_BASE_URL = "https://techtake-api.onrender.com";
```

### No arquivo `Front/admin-login.html`, altere a linha:
```js
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://SEU-BACKEND.onrender.com';
```

### No arquivo `Front/admin-panel.html`, altere a linha:
```js
const API_URL = (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://SEU-BACKEND.onrender.com') + '/api';
```

### No Render, atualize a variável:
| Variável | Valor |
|---|---|
| `FRONTEND_ORIGIN` | `https://techtake-site.netlify.app` (URL real do Netlify) |

Depois faça **redeploy** no Render e **redeploy** no Netlify (ou faça um push no git).

---

## Desenvolvimento Local

```bash
# 1. Instalar dependências
cd Back && npm install

# 2. Criar banco de dados com dados iniciais
node seed.js

# 3. Iniciar o servidor (serve o front também em localhost:3000)
npm start
```

Acesse: `http://localhost:3000`

> Em modo local o `NODE_ENV` não é `production`, então o servidor
> serve tanto a API quanto os arquivos HTML do Front.

---

## Problemas comuns

| Erro | Causa | Solução |
|---|---|---|
| CORS bloqueado | `FRONTEND_ORIGIN` incorreto no Render | Atualize para a URL exata do Netlify |
| 404 nas rotas | `netlify.toml` não está na pasta `Front` | Verifique se o arquivo existe em `Front/netlify.toml` |
| API não responde | Backend "sleeping" no Render free tier | Aguarde ~30s no primeiro acesso |
| Login não funciona | `PROD_API_BASE_URL` incorreto no `config.js` | Verifique a URL do Render em `config.js` |
| Token inválido após redeploy | `JWT_SECRET` mudou | Use um valor fixo no Render (não `generateValue`) |
