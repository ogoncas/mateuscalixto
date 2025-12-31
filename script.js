import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, getDocs, query, orderBy, doc, setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, updateProfile, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyDjuRApif2O4TgX2mAycKEcXULCnFSapbQ",
    authDomain: "mateuscalixto-b8d30.firebaseapp.com",
    projectId: "mateuscalixto-b8d30",
    storageBucket: "mateuscalixto-b8d30.firebasestorage.app",
    messagingSenderId: "1028342828902",
    appId: "1:1028342828902:web:6d283c8280e7c8aa5542a7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- VARIÁVEIS DE CONTROLE ---
let paginaAtual = 1;
const noticiasPorPagina = 3;
let todasNoticias = [];

// Seletores
const grid = document.getElementById('news-grid');
const heroSection = document.getElementById('hero-section');
const heroTitle = document.getElementById('hero-title');
const heroSummary = document.getElementById('hero-summary');
const searchInput = document.getElementById('search-input');

// --- CARREGAMENTO DE NOTÍCIAS ---
async function carregarNoticias(filtro = "") {
    if (!grid) return;

    try {
        const q = query(collection(db, "noticias"), orderBy("data", "desc"));
        const querySnapshot = await getDocs(q);
        
        todasNoticias = [];
        querySnapshot.forEach(doc => {
            todasNoticias.push({ id: doc.id, ...doc.data() });
        });

        renderizarPagina(filtro);
    } catch (error) {
        console.error("Erro ao carregar notícias: ", error);
    }
}

function renderizarPagina(filtro = "") {
    const termo = filtro.toLowerCase().trim();
    
    // Filtrar localmente
    const noticiasFiltradas = todasNoticias.filter(data => {
        return data.titulo.toLowerCase().includes(termo) || 
               data.resumo.toLowerCase().includes(termo);
    });

    // Lógica do Hero (Só na pág 1 e sem pesquisa)
    if (heroSection) {
        if (termo === "" && paginaAtual === 1 && noticiasFiltradas.length > 0) {
            heroSection.style.display = "block";
            const destaque = noticiasFiltradas[0];
            heroTitle.innerHTML = `<a href="post.html?id=${destaque.id}" style="color:inherit; text-decoration:none;">${destaque.titulo}</a>`;
            heroSummary.innerText = destaque.resumo;
        } else {
            heroSection.style.display = "none";
        }
    }

    // Paginação (Slice)
    const indiceInicial = (paginaAtual - 1) * noticiasPorPagina;
    const indiceFinal = indiceInicial + noticiasPorPagina;
    const noticiasExibidas = noticiasFiltradas.slice(indiceInicial, indiceFinal);

    grid.innerHTML = "";

    if (noticiasExibidas.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">Nenhuma notícia encontrada.</p>`;
    } else {
        noticiasExibidas.forEach((data) => {
            const card = document.createElement('article');
            card.className = 'news-card';
            card.innerHTML = `
                <a href="post.html?id=${data.id}" style="text-decoration: none; color: inherit;">
                    <img src="${data.imagem || 'https://via.placeholder.com/400x250'}" class="card-image">
                    <span class="news-date">${formatDate(data.data)}</span>
                    <h4>${data.titulo}</h4>
                    <p class="news-excerpt">${data.resumo}</p>
                </a>
            `;
            grid.appendChild(card);
        });
    }

    renderizarControlesPaginacao(noticiasFiltradas.length);
}

function renderizarControlesPaginacao(totalItens) {
    let paginacaoContainer = document.getElementById('pagination-controls');
    
    if (!paginacaoContainer) {
        paginacaoContainer = document.createElement('div');
        paginacaoContainer.id = 'pagination-controls';
        paginacaoContainer.style.cssText = "display:flex; justify-content:center; align-items:center; gap:10px; margin: 40px 0; grid-column: 1/-1;";
        grid.after(paginacaoContainer);
    }

    const totalPaginas = Math.ceil(totalItens / noticiasPorPagina);
    paginacaoContainer.innerHTML = "";

    if (totalPaginas <= 1) return;

    // Botão Anterior <
    const btnAnt = document.createElement('button');
    btnAnt.innerHTML = "&#10094;"; 
    estilizarSeta(btnAnt, paginaAtual > 1);
    if (paginaAtual > 1) btnAnt.onclick = () => mudarPagina(paginaAtual - 1);
    paginacaoContainer.appendChild(btnAnt);

    // Números das Páginas
    for (let i = 1; i <= totalPaginas; i++) {
        const btnNum = document.createElement('button');
        btnNum.innerText = i;
        const isAtiva = (i === paginaAtual);
        
        btnNum.style.cssText = `
            border: none;
            background: none;
            padding: 5px 12px;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            font-size: 1.2rem;
            font-weight: ${isAtiva ? '700' : '400'};
            color: ${isAtiva ? '#000' : '#888'};
            border-bottom: ${isAtiva ? '3px solid #000' : '3px solid transparent'};
            transition: 0.3s;
        `;
        
        btnNum.onclick = () => mudarPagina(i);
        paginacaoContainer.appendChild(btnNum);
    }

    // Botão Próximo >
    const btnProx = document.createElement('button');
    btnProx.innerHTML = "&#10095;";
    estilizarSeta(btnProx, paginaAtual < totalPaginas);
    if (paginaAtual < totalPaginas) btnProx.onclick = () => mudarPagina(paginaAtual + 1);
    paginacaoContainer.appendChild(btnProx);
}

function estilizarSeta(btn, ativo) {
    btn.style.cssText = `
        border: none;
        background: none;
        font-size: 1.3rem;
        cursor: ${ativo ? 'pointer' : 'not-allowed'};
        opacity: ${ativo ? '1' : '0.2'};
        padding: 10px;
        color: #000;
        transition: 0.2s;
    `;
}

function mudarPagina(n) {
    paginaAtual = n;
    renderizarPagina(searchInput ? searchInput.value : "");
    window.scrollTo({ top: grid.offsetTop - 120, behavior: 'smooth' });
}

function formatDate(timestamp) {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// --- MODAL DE AUTENTICAÇÃO ---
window.openAuthModal = () => document.getElementById('auth-modal-overlay')?.classList.remove('hidden');
window.closeAuthModal = () => document.getElementById('auth-modal-overlay')?.classList.add('hidden');
window.toggleAuthStep = (step) => {
    const loginStep = document.getElementById('login-step');
    const signupStep = document.getElementById('signup-step');
    if (step === 'signup') {
        loginStep.classList.add('hidden');
        signupStep.classList.remove('hidden');
    } else {
        loginStep.classList.remove('hidden');
        signupStep.classList.add('hidden');
    }
};

// Eventos de Autenticação
const signupForm = document.getElementById('reader-signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('r-signup-name').value;
        const email = document.getElementById('r-signup-email').value;
        const pass = document.getElementById('r-signup-pass').value;
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(userCred.user, { displayName: nome });
            closeAuthModal();
        } catch (error) { alert("Erro: " + error.message); }
    });
}

const loginForm = document.getElementById('reader-login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('r-login-email').value;
        const pass = document.getElementById('r-login-pass').value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            closeAuthModal();
        } catch (error) { alert("Erro: " + error.message); }
    });
}

document.getElementById('btn-logout')?.addEventListener('click', () => signOut(auth));

// Monitor de Login
onAuthStateChanged(auth, (user) => {
    const loggedOutDiv = document.getElementById('user-logged-out');
    const loggedInDiv = document.getElementById('user-logged-in');
    const nameDisplay = document.getElementById('user-name-display');
    if (user) {
        loggedOutDiv?.classList.add('hidden');
        loggedInDiv?.classList.remove('hidden');
        if (nameDisplay) nameDisplay.innerText = user.displayName || "Leitor";
    } else {
        loggedOutDiv?.classList.remove('hidden');
        loggedInDiv?.classList.add('hidden');
    }
});

// Inicialização e Busca
carregarNoticias();
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        paginaAtual = 1;
        renderizarPagina(e.target.value);
    });
}