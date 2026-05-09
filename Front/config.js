// ========================================
// CONFIG API
// ========================================

// Altere este valor para o host público quando o site estiver em produção.
// Mantenha localhost para desenvolvimento local.
const LOCAL_API_BASE_URL = "http://localhost:3000";
const PROD_API_BASE_URL = "https://techtake-site.onrender.com"; // <-- URL do Render (atualize se necessário)
const API_BASE_URL = window.location.hostname === "localhost" ? LOCAL_API_BASE_URL : PROD_API_BASE_URL;

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
        const response = await fetch(`${API_BASE_URL}/api/pedidos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

function protegerConteudo() {
    const body = document.body;
    if (body) {
        body.style.userSelect = 'none';
        body.style.webkitUserSelect = 'none';
        body.style.msUserSelect = 'none';
    }

    document.addEventListener('contextmenu', (event) => event.preventDefault());
    document.addEventListener('copy', (event) => event.preventDefault());
    document.addEventListener('cut', (event) => event.preventDefault());
    document.addEventListener('selectstart', (event) => event.preventDefault());
    document.addEventListener('dragstart', (event) => event.preventDefault());
    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        const blocked = [
            'u', 's', 'c', 'p', 'a',
            'i', 'j', 'k', 'f12'
        ];

        if (
            event.ctrlKey && blocked.includes(key) ||
            event.metaKey && blocked.includes(key) ||
            event.key === 'F12' ||
            (event.ctrlKey && event.shiftKey && ['i', 'c', 'j'].includes(key))
        ) {
            event.preventDefault();
            event.stopPropagation();
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
    protegerConteudo();
});
