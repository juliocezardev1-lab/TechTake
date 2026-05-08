# 🎥 Sistema de Catálogo e Painel Admin - Buxa Audio Visual

## 📋 Visão Geral

Este sistema permite que você gerencie seus pacotes de serviços audiovisuais através de um painel administrativo, e os clientes possam visualizar todos os serviços disponíveis em uma página dedicada.

## 🚀 Como Começar

### 1. Popular o Banco de Dados com os Pacotes

Execute o script de seed para adicionar os pacotes do catálogo ao banco de dados:

```bash
cd Back
node seed.js
```

Este comando irá:
- Criar os 5 pacotes principais do catálogo
- Adicionar os pacotes com drone
- Criar o usuário admin padrão

### 2. Credenciais de Admin

As credenciais padrão são:

```
Email:    admin@buxaaudiovisual.com
Senha:    Admin@2024!Secure
```

Estas credenciais estão salvas em: `Back/admin-credentials.txt`

**⚠️ IMPORTANTE:** Altere a senha após o primeiro login por segurança!

## 🌐 URLs do Sistema

### Para Clientes
- **Página de Serviços:** http://localhost:3000/servicos
  - Aqui os clientes podem visualizar todos os pacotes
  - Escolher entre pacotes normais, com drone e adicionais
  - Clicar em "Contratar" para enviar para o WhatsApp

### Para Administradores
- **Login Admin:** http://localhost:3000/admin-login
- **Painel Admin:** http://localhost:3000/admin-panel (após login)

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas

#### 1. `pacotes`
Armazena os pacotes de serviços principais:
```
- id: ID único
- nome: Nome do pacote (ex: "Social Creator")
- configuracao_tecnica: Detalhes técnicos
- destaque_servico: O que torna especial
- investimento_min: Valor mínimo
- investimento_max: Valor máximo
- descricao: Descrição completa
- atualizado_em: Data da última atualização
```

#### 2. `pacotes_drone`
Armazena pacotes adicionais com drone:
```
- id: ID único
- pacote_id: Referência ao pacote principal
- configuracao_tecnica: Specs do drone
- destaque_servico: O que ele oferece
- investimento: Valor do serviço
```

#### 3. `admin`
Armazena credenciais de administradores:
```
- id: ID único
- email: Email de login
- senha: Senha hash (bcrypt)
- criado_em: Data de criação
```

## 🎨 Funcionalidades do Painel Admin

### Gerenciar Pacotes Normais
✅ Visualizar todos os pacotes
✅ Criar novo pacote
✅ Editar pacote existente
✅ Deletar pacote

### Gerenciar Pacotes com Drone
✅ Visualizar pacotes com drone
✅ Criar novo pacote drone
✅ Editar pacote drone
✅ Deletar pacote drone

### Funcionalidades de Segurança
✅ Autenticação com JWT
✅ Tokens com expiração de 24h
✅ Proteção de rotas com middleware

## 🔧 API Endpoints

### Publicamente Disponível
- `GET /api/pacotes` - Lista todos os pacotes
- `GET /api/pacotes-drone` - Lista todos os pacotes com drone

### Requer Autenticação de Admin
- `POST /api/admin/login` - Fazer login
- `POST /api/admin/pacotes` - Criar pacote
- `PUT /api/admin/pacotes/:id` - Atualizar pacote
- `DELETE /api/admin/pacotes/:id` - Deletar pacote
- `POST /api/admin/pacotes-drone` - Criar pacote drone
- `PUT /api/admin/pacotes-drone/:id` - Atualizar pacote drone
- `DELETE /api/admin/pacotes-drone/:id` - Deletar pacote drone

## 📝 Como Usar o Painel Admin

### 1. Fazer Login
1. Acesse http://localhost:3000/admin-login
2. Digite: `admin@buxaaudiovisual.com`
3. Senha: `Admin@2024!Secure`
4. Clique em "Entrar"

### 2. Navegar Entre as Abas
- **Aba de Pacotes:** Para gerenciar pacotes normais
- **Aba com Drone:** Para gerenciar pacotes com drone

### 3. Adicionar Novo Pacote
1. Clique no botão "Adicionar Novo Pacote"
2. Preencha os campos:
   - **Nome:** Nome único do pacote
   - **Config. Técnica:** Especificações técnicas
   - **Destaque de Serviço:** O que torna especial
   - **Investimento Mín.:** Valor mínimo em reais
   - **Investimento Máx.:** Valor máximo em reais
   - **Descrição:** Descrição detalhada (opcional)
3. Clique em "Salvar Pacote"

### 4. Editar Pacote Existente
1. Clique no botão "Editar" no pacote
2. Modifique os campos desejados
3. Clique em "Salvar Pacote"

### 5. Deletar Pacote
1. Clique no botão "Deletar" no pacote
2. Confirme a exclusão
3. Pacote será removido imediatamente

## 👥 Para Clientes - Página de Serviços

### Como Contratar
1. Acesse http://localhost:3000/servicos
2. Veja os pacotes organizados em 3 abas:
   - **Pacotes de Serviços:** Pacotes principais
   - **Com Drone:** Pacotes adicionais com drone
   - **Adicionais:** Serviços extras (Seguro de Mídia)
3. Clique em "Contratar Agora"
4. Será aberto o WhatsApp com a mensagem pré-preenchida
5. Confirme o envio

## 💾 Dados do Catálogo

### Pacotes Criados Automaticamente

#### 1. Social Creator (R$ 150-200)
- Config: FHD/4K, 12MP
- Ideal para redes sociais

#### 2. Performance & Music (R$ 250-400)
- Config: UHD 60FPS, Zoom 3X/10X
- Ideal para eventos musicais

#### 3. Business & Profissional (R$ 550-800)
- Config: UHD 4K, Fotos 50MP
- Ideal para empresas

#### 4. Fine Art & Produto (R$ 900-1.200)
- Config: Fotos 200MP, Vídeo 8K
- Ideal para produtos de luxo

#### 5. Eventos/Institucional (R$ 1.300-2.000+)
- Config: UHD 30/60FPS
- Ideal para eventos grandes

### Adicionais
- **Seguro de Mídia:** R$ 30 (taxa única)
- **Pacotes com Drone:** Valores adicionais

## 🔐 Segurança

### Boas Práticas Implementadas
✅ Senhas com hash bcrypt
✅ JWT para autenticação
✅ Validação de entrada com express-validator
✅ CORS configurado
✅ Helmet para headers de segurança
✅ Rate limiting para proteção contra ataques

### Recomendações para Produção
1. Alterar `JWT_SECRET` no `.env`
2. Alterar senha de admin padrão
3. Usar HTTPS
4. Configurar CORS para origem específica
5. Backup regular do banco de dados

## 🐛 Troubleshooting

### Erro: "Credenciais inválidas"
- Verifique se rodou `node seed.js`
- Certifique-se de digitar a senha corretamente

### Pacotes não aparecem
- Verifique se o seed foi executado
- Teste a API diretamente: http://localhost:3000/api/pacotes

### Erro ao fazer login
- Limpe o cache do navegador
- Tente incógnito/anônimo
- Verifique se o servidor está rodando

## 📚 Arquivos Criados/Modificados

```
Back/
├── seed.js                    (NOVO) Script para popular BD
├── routes/admin.js           (NOVO) Rotas de admin
├── models/db.js              (EDITADO) Adicionadas tabelas
├── admin-credentials.txt      (NOVO) Credenciais salvas
└── server.js                 (EDITADO) Rotas de admin adicionadas

Front/
├── admin-login.html          (NOVO) Login do admin
├── admin-panel.html          (NOVO) Painel de controle
└── servicos.html             (EDITADO) Página atualizada
```

## 🎯 Próximos Passos

1. Executar `npm install` (se necessário)
2. Executar `node Back/seed.js`
3. Iniciar o servidor
4. Acessar http://localhost:3000/admin-login
5. Customizar os pacotes conforme necessário

## 📞 Suporte

Para dúvidas ou problemas, revise este arquivo ou consulte a documentação das tecnologias usadas:
- Express.js: https://expressjs.com
- SQLite: https://www.sqlite.org
- JWT: https://jwt.io
- bcrypt: https://www.npmjs.com/package/bcrypt

---

**Desenvolvido para Buxa Audio Visual**
Data: 2026
