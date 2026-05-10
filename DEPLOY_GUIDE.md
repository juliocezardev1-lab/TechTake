# Deploy — TechTake Audiovisual

## Arquitetura de produção

```
Netlify  →  pasta /Front  (site estático: HTML, CSS, JS)
Render   →  pasta /Back   (API Node.js: login, pedidos, pacotes)
```

O frontend faz chamadas para a API do Render via `fetch()`.
O arquivo que controla para qual URL chamar é `Front/config.js`.

---

## Passo 1 — Backend no Render

1. Acesse **render.com** → New → **Web Service**
2. Conecte o repositório do GitHub
3. Preencha:
   - **Name:** `techtake-api` (ou qualquer nome)
   - **Root Directory:** deixe vazio
   - **Build Command:** `cd Back && npm install && node seed.js`
   - **Start Command:** `npm start`
4. Clique em **Advanced** → **Add Environment Variable** e adicione:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | Uma chave longa qualquer (ex: `xK9#mP2@qL5vN8!rT3wZ`) |
   | `FRONTEND_ORIGIN` | Preencha depois do Passo 2 |

5. Clique em **Deploy**
6. Aguarde o deploy terminar e copie a URL, ex: `https://techtake-api.onrender.com`

---

## Passo 2 — Frontend no Netlify

1. Acesse **netlify.com** → **Add new site** → **Import an existing project**
2. Conecte o repositório do GitHub
3. Preencha:
   - **Base directory:** `Front`
   - **Publish directory:** `Front`
   - **Build command:** deixe vazio
4. Clique em **Deploy site**
5. Copie a URL gerada, ex: `https://techtake-audiovisual.netlify.app`

---

## Passo 3 — Conectar os dois (3 substituições)

### 3a. No arquivo `Front/config.js`

Localize a linha:
```js
: 'https://SEU-BACKEND.onrender.com'; // ← SUBSTITUA AQUI
```
Substitua pela URL do seu Render:
```js
: 'https://techtake-api.onrender.com';
```

### 3b. No arquivo `Front/admin-login.html`

Localize:
```js
: 'https://SEU-BACKEND.onrender.com';
```
Substitua da mesma forma.

### 3c. No arquivo `Front/admin-panel.html`

Localize:
```js
: 'https://SEU-BACKEND.onrender.com' + '/api';
```
Substitua da mesma forma.

### 3d. No Render, volte à variável `FRONTEND_ORIGIN`

Coloque a URL do Netlify:
```
https://techtake-audiovisual.netlify.app
```

Após essas alterações, faça **commit + push** no GitHub.
O Netlify e o Render fazem o redeploy automaticamente.

---

## Desenvolvimento local

```bash
# Instalar dependências do backend
cd Back
npm install

# Criar banco de dados com dados iniciais (só na primeira vez)
node seed.js

# Iniciar o servidor (serve a API + os arquivos HTML em localhost:3000)
npm start
```

Acesse: `http://localhost:3000`

**Credenciais do admin (criadas pelo seed.js):**
- E-mail: `admin@buxaaudiovisual.com`
- Senha: `Admin@2024!Secure`

---

## Problema: CORS bloqueado

Significa que `FRONTEND_ORIGIN` no Render está errado.
Verifique se é exatamente a URL do Netlify, sem barra no final, com `https://`.

## Problema: API não responde (primeira vez)

O plano gratuito do Render "dorme" após inatividade.
A primeira requisição demora ~30 segundos para "acordar" o servidor. É normal.

## Problema: Login inválido após redeploy

O `JWT_SECRET` mudou entre deploys. No Render, defina o `JWT_SECRET` manualmente
com um valor fixo — nunca use "Generate" do Render para ele.
