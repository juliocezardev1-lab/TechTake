// ============================================================
// CONFIG.JS — Configurações globais do frontend
// Este arquivo é carregado por todas as páginas HTML
// ============================================================

// ── URL da API ───────────────────────────────────────────────
//
// Em desenvolvimento local:  frontend e backend rodam no mesmo localhost:3000
// Em produção (Netlify):     o frontend está em outro domínio que não é o backend
//
// ⚠️  Quando fizer deploy, substitua a URL abaixo pela URL real do seu backend no Render.
//     Exemplo: "https://techtake-api.onrender.com"
//     Você encontra essa URL no painel do Render após o primeiro deploy.
//
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'           // desenvolvimento local
    : 'https://SEU-BACKEND.onrender.com'; // ← SUBSTITUA AQUI

// ============================================================
// AUTENTICAÇÃO
// ============================================================

// Retorna o token JWT salvo (localStorage = "lembre-me", sessionStorage = sessão)
function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// Retorna os dados do usuário logado ou null
function getUsuario() {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    try { return raw ? JSON.parse(raw) : null; }
    catch { return null; }
}

// Verifica com o backend se o token atual ainda é válido
async function getAuthStatus() {
    const token = getToken();
    if (!token) return { authenticated: false };

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/status`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return await res.json();
    } catch {
        return { authenticated: false };
    }
}

// Redireciona para /login se o usuário não estiver autenticado
// Use em páginas que exigem login
async function protegerPagina() {
    const status = await getAuthStatus();
    if (!status.authenticated) {
        window.location.href = '/login';
    }
}

// Redireciona para /home se o usuário JÁ estiver autenticado
// Use nas páginas de login e cadastro (para não mostrar o form para quem já logou)
async function redirecionarSeLogado() {
    const status = await getAuthStatus();
    if (status.authenticated) {
        window.location.href = '/home';
    }
}

// Apaga os dados de sessão e redireciona para login
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    window.location.href = '/login';
}

// ============================================================
// FORMULÁRIO DE CONTATO (página /contato)
// ============================================================

// Este listener só dispara se existir um botão com id="btnSend" na página
const btnSend = document.getElementById('btnSend');

btnSend?.addEventListener('click', async () => {
    const nome     = document.getElementById('nome')?.value?.trim();
    const email    = document.getElementById('email')?.value?.trim();
    const telefone = document.getElementById('telefone')?.value?.trim();
    const servico  = document.getElementById('servico')?.value;
    const mensagem = document.getElementById('mensagem')?.value?.trim();

    if (!nome || !email || !mensagem) {
        showMessage('Preencha os campos obrigatórios.', 'error');
        return;
    }

    btnSend.disabled = true;
    btnSend.textContent = 'Enviando...';

    try {
        const res  = await fetch(`${API_BASE_URL}/api/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, telefone, servico, mensagem })
        });
        const data = await res.json();

        if (data.success) {
            document.getElementById('formWrap')?.style.setProperty('display', 'none');
            document.getElementById('formSuccess')?.style.setProperty('display', 'block');
            showMessage('Pedido enviado com sucesso!', 'success');
        } else {
            showMessage(data.error || 'Erro ao enviar.', 'error');
        }
    } catch {
        showMessage('Não foi possível conectar ao servidor.', 'error');
    } finally {
        btnSend.disabled = false;
        btnSend.textContent = 'Enviar Pedido';
    }
});

// ============================================================
// UTILITÁRIOS DE UI
// ============================================================

// Exibe uma mensagem de feedback para o usuário
// type: 'success' | 'error'
function showMessage(message, type) {
    const el = document.getElementById('message');
    if (el) {
        el.innerHTML = `<p class="${type}-msg">${message}</p>`;
        setTimeout(() => { el.innerHTML = ''; }, 5000);
    } else {
        alert(message);
    }
}

// Atualiza o menu de navegação conforme o estado de autenticação
async function atualizarMenu() {
    const token      = getToken();
    const navAuthItem = document.getElementById('navAuthItem');
    const logoutBtn   = document.getElementById('logoutBtn');

    if (token) {
        // Usuário logado: mostra botão de sair, esconde links de entrar/cadastrar
        if (logoutBtn)   logoutBtn.style.display = 'inline-block';
        if (navAuthItem) navAuthItem.innerHTML = '';
    } else {
        // Usuário não logado: esconde botão de sair, mostra links de entrar/cadastrar
        if (logoutBtn)   logoutBtn.style.display = 'none';
        if (navAuthItem) navAuthItem.innerHTML = `
            <a href="/login">Entrar</a>
            <span style="margin:0 .35rem;color:rgba(255,255,255,.5)">|</span>
            <a href="/cadastro">Cadastrar</a>
        `;
    }
}

// Inicializa o menu hamburguer para mobile
function initMobileNav() {
    const nav   = document.querySelector('nav#navbar');
    const links = nav?.querySelector('.nav-links');
    if (!nav || !links || nav.querySelector('.nav-toggle')) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Abrir menu');
    toggle.appendChild(document.createElement('span'));
    nav.appendChild(toggle);

    toggle.addEventListener('click', () => nav.classList.toggle('nav-open'));

    links.querySelectorAll('a, button').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 900) nav.classList.remove('nav-open');
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) nav.classList.remove('nav-open');
    });
}

// Proteção básica de conteúdo (bloqueia Ctrl+U e F12 fora de campos de formulário)
function initProtecaoConteudo() {
    // Desativa seleção de texto no body, mas permite dentro de inputs e textareas
    const style = document.createElement('style');
    style.textContent = `
        body { user-select: none; -webkit-user-select: none; }
        input, textarea, select { user-select: text !important; -webkit-user-select: text !important; }
    `;
    document.head.appendChild(style);

    document.addEventListener('keydown', (e) => {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (['input', 'textarea', 'select'].includes(tag)) return; // não bloqueia dentro de formulários

        const k = e.key;
        if ((e.ctrlKey && k === 'u') || k === 'F12' || (e.ctrlKey && e.shiftKey && ['i', 'j'].includes(k.toLowerCase()))) {
            e.preventDefault();
        }
    });
}

// ============================================================
// INICIALIZAÇÃO (executado quando o DOM estiver pronto)
// ============================================================

window.addEventListener('DOMContentLoaded', () => {
    // Conecta o botão de logout ao handler de logout
    document.getElementById('logoutBtn')?.addEventListener('click', logout);

    atualizarMenu();
    initMobileNav();
    initProtecaoConteudo();
});
