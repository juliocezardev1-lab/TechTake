// ========================================
// CONFIG API
// ========================================

// LOCAL: backend roda em localhost:3000
// PRODUÇÃO: frontend no Netlify, backend no Render (URLs diferentes)
//
// ⚠️  SUBSTITUA a URL abaixo pela URL real do seu backend no Render:
//     Exemplo: "https://techtake-api.onrender.com"
//
const LOCAL_API_BASE_URL = "http://localhost:3000";
const PROD_API_BASE_URL = "https://SEU-BACKEND.onrender.com"; // ← altere aqui

const API_BASE_URL = window.location.hostname === "localhost"
    ? LOCAL_API_BASE_URL
    : PROD_API_BASE_URL;

// ========================================
// ENVIAR PEDIDO / ORÇAMENTO
// ========================================

const btnSend = document.getElementById("btnSend");

btnSend?.addEventListener("click", async () => {
    const nome = document.getElementById("nome")?.value;
    const email = document.getElementById("email")?.value;
    const telefone = document.getElementById("telefone")?.value;
    const servico = document.getElementById("servico")?.value;
    const mensagem = document.getElementById("mensagem")?.value;

    btnSend.disabled = true;
    btnSend.textContent = "Enviando...";

    if (!nome || !email || !mensagem) {
        showMessage("Preencha os campos obrigatórios.", "error");
        btnSend.disabled = false;
        btnSend.textContent = "Enviar Pedido";
        return;
    }

    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/pedidos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ nome, email, telefone, servico, mensagem })
        });

        const data = await response.json();

        if (data.success) {
            const formWrap = document.getElementById("formWrap");
            const formSuccess = document.getElementById("formSuccess");

            if (formWrap) formWrap.style.display = "none";
            if (formSuccess) formSuccess.style.display = "block";

            showMessage("Pedido enviado com sucesso!", "success");
        } else {
            showMessage(data.error || "Erro ao enviar.", "error");
        }
    } catch (error) {
        console.error(error);
        showMessage("Erro ao conectar com servidor.", "error");
    } finally {
        btnSend.disabled = false;
        btnSend.textContent = "Enviar Pedido";
    }
});

// ========================================
// AUXILIAR DE AUTENTICAÇÃO
// ========================================

function getToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function usuarioLogado() {
    return !!getToken();
}

function pegarUsuario() {
    const usuario = localStorage.getItem("usuario") || sessionStorage.getItem("usuario");
    if (!usuario) return null;
    try {
        return JSON.parse(usuario);
    } catch (error) {
        console.error("Erro ao ler usuário do armazenamento:", error);
        return null;
    }
}

async function getAuthStatus() {
    const token = getToken();
    if (!token) return { authenticated: false };

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao validar token:', error);
        return { authenticated: false };
    }
}

async function protegerPagina() {
    const status = await getAuthStatus();
    if (!status.authenticated) {
        window.location.href = "/login";
    }
}

async function redirecionarSeLogado() {
    const status = await getAuthStatus();
    if (status.authenticated) {
        window.location.href = "/home";
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    window.location.href = "/login";
}

function showMessage(message, type) {
    const messageDiv = document.getElementById("message");
    if (messageDiv) {
        messageDiv.innerHTML = `<p class="${type}-msg">${message}</p>`;
        setTimeout(() => {
            messageDiv.innerHTML = "";
        }, 5000);
    } else {
        alert(message);
    }
}

function initMobileNav() {
    const nav = document.querySelector('nav#navbar, nav.navbar');
    const links = nav?.querySelector('.nav-links, .nav-right');
    if (!nav || !links) return;

    if (!nav.querySelector('.nav-toggle')) {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-label', 'Abrir menu');

        const bar = document.createElement('span');
        toggle.appendChild(bar);
        nav.appendChild(toggle);

        toggle.addEventListener('click', () => {
            nav.classList.toggle('nav-open');
        });

        links.querySelectorAll('a, button').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 900) {
                    nav.classList.remove('nav-open');
                }
            });
        });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            nav.classList.remove('nav-open');
        }
    });
}

function protegerConteudo() {
    // Desativa seleção de texto apenas em elementos não-interativos
    const style = document.createElement('style');
    style.textContent = `
        body { user-select: none; -webkit-user-select: none; }
        input, textarea, select, [contenteditable] {
            user-select: text !important;
            -webkit-user-select: text !important;
        }
    `;
    document.head.appendChild(style);

    // Bloqueia Ctrl+U (view-source) e F12 fora de campos de formulário
    document.addEventListener('keydown', (event) => {
        const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        const isFormField = ['input', 'textarea', 'select'].includes(tag);
        if (isFormField) return; // permite tudo dentro de formulários

        const key = event.key.toLowerCase();
        if (
            (event.ctrlKey && key === 'u') ||
            event.key === 'F12' ||
            (event.ctrlKey && event.shiftKey && ['i', 'j'].includes(key))
        ) {
            event.preventDefault();
        }
    });
}

async function atualizarMenuAutenticacao() {
    const token = getToken();
    const navAuthItem = document.getElementById("navAuthItem");
    const logoutBtn = document.getElementById("logoutBtn");

    if (token) {
        if (logoutBtn) {
            logoutBtn.style.display = "inline-block";
            logoutBtn.textContent = "Sair";
        }
        if (navAuthItem) {
            navAuthItem.innerHTML = "";
        }
    } else {
        if (logoutBtn) {
            logoutBtn.style.display = "none";
        }
        if (navAuthItem) {
            navAuthItem.innerHTML = `
                <a href="/login">Entrar</a>
                <span style="margin: 0 .35rem; color: rgba(255,255,255,.5);">|</span>
                <a href="/cadastro">Cadastrar</a>
            `;
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    atualizarMenuAutenticacao();
    initMobileNav();
    protegerConteudo();
});
