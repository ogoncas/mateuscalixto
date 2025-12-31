import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, getDocs, query, orderBy, doc, setDoc, where 
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

// --- SELETORES DE INTERFACE ---
const grid = document.getElementById('news-grid');
const heroSection = document.getElementById('hero-section');
const heroTitle = document.getElementById('hero-title');
const heroSummary = document.getElementById('hero-summary');
const searchInput = document.getElementById('search-input');
const paginationContainer = document.getElementById('pagination-controls');

// --- VARIÁVEIS DE ESTADO DA PAGINAÇÃO ---
let todasNoticias = [];
let paginaAtual = 1;
const noticiasPorPagina = 3;

// --- CARREGAR NOTÍCIAS DO FIREBASE ---
async function carregarNoticias(filtro = "") {
    if (!grid) return;

    try {
        const q = query(collection(db, "noticias"), orderBy("data", "desc"));
        const querySnapshot = await getDocs(q);
        
        const termo = filtro.toLowerCase().trim();
        todasNoticias = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const noTitulo = data.titulo.toLowerCase().includes(termo);
            const noResumo = data.resumo.toLowerCase().includes(termo);
            
            if (termo === "" || noTitulo || noResumo) {
                todasNoticias.push({ id: doc.id, ...data });
            }
        });

        // MANUTENÇÃO DO HERO: Agora o heroSection permanece visível mesmo com filtro
        if (heroSection) {
            heroSection.style.display = "block";
        }

        renderizarPagina(1); 

    } catch (error) {
        console.error("Erro ao carregar notícias: ", error);
    }
}

// --- RENDERIZAR UMA PÁGINA ESPECÍFICA ---
function renderizarPagina(pagina) {
    paginaAtual = pagina;
    grid.innerHTML = "";

    if (todasNoticias.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">Nenhuma notícia encontrada.</p>`;
        if (paginationContainer) paginationContainer.innerHTML = "";
        // Opcional: esconder o hero se não houver NENHUM resultado na busca
        if (heroSection) heroSection.style.display = "none";
        return;
    } else {
        if (heroSection) heroSection.style.display = "block";
    }

    // Lógica do Hero: Aparece na página 1, exibindo o primeiro resultado da lista (seja da busca ou geral)
    if (paginaAtual === 1) {
        const destaque = todasNoticias[0]; 
        if (destaque) {
            if (heroTitle) heroTitle.innerHTML = `<a href="post.html?id=${destaque.id}">${destaque.titulo}</a>`;
            if (heroSummary) heroSummary.innerText = destaque.resumo;
        }
    }

    const inicio = (paginaAtual - 1) * noticiasPorPagina;
    const fim = inicio + noticiasPorPagina;
    const noticiasExibidas = todasNoticias.slice(inicio, fim);

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

    renderizarControlesPagina(todasNoticias.length);
}

// --- GERAR BOTÕES DE PAGINAÇÃO ---
function renderizarControlesPagina(totalItens) {
    if (!paginationContainer) return;
    
    const totalPaginas = Math.ceil(totalItens / noticiasPorPagina);
    paginationContainer.innerHTML = "";

    if (totalPaginas <= 1) return;

    const btnPrev = document.createElement('button');
    btnPrev.className = 'pagination-btn';
    btnPrev.innerHTML = "&lt;";
    btnPrev.disabled = paginaAtual === 1;
    btnPrev.onclick = () => {
        renderizarPagina(paginaAtual - 1);
        window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
    };
    paginationContainer.appendChild(btnPrev);

    for (let i = 1; i <= totalPaginas; i++) {
        const btnNum = document.createElement('button');
        btnNum.className = `pagination-btn ${i === paginaAtual ? 'active' : ''}`;
        btnNum.innerText = i;
        btnNum.onclick = () => {
            renderizarPagina(i);
            window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
        };
        paginationContainer.appendChild(btnNum);
    }

    const btnNext = document.createElement('button');
    btnNext.className = 'pagination-btn';
    btnNext.innerHTML = "&gt;";
    btnNext.disabled = paginaAtual === totalPaginas;
    btnNext.onclick = () => {
        renderizarPagina(paginaAtual + 1);
        window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
    };
    paginationContainer.appendChild(btnNext);
}

// --- EVENTO DE BUSCA ---
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        carregarNoticias(e.target.value);
    });
}

// --- FORMATAR DATA ---
function formatDate(timestamp) {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// --- GESTÃO DE AUTENTICAÇÃO ---
window.openAuthModal = () => document.getElementById('auth-modal-root').classList.remove('hidden');
window.closeAuthModal = () => document.getElementById('auth-modal-root').classList.add('hidden');

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

const signupForm = document.getElementById('reader-signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('r-signup-email').value;
        const pass = document.getElementById('r-signup-pass').value;
        const name = document.getElementById('r-signup-displayname').value;
        const username = document.getElementById('r-signup-username').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(userCredential.user, { displayName: name });
            await setDoc(doc(db, "usuarios", userCredential.user.uid), {
                nome: name,
                username: username,
                email: email,
                tipo: 'leitor'
            });
            alert("Conta criada com sucesso!");
            closeAuthModal();
        } catch (error) {
            alert("Erro ao criar conta: " + error.message);
        }
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
        } catch (error) {
            alert("Erro no login: " + error.message);
        }
    });
}

document.getElementById('btn-logout')?.addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
    const loggedOutDiv = document.getElementById('user-logged-out');
    const loggedInDiv = document.getElementById('user-logged-in');
    const nameDisplay = document.getElementById('user-name-display');

    if (user) {
        if (loggedOutDiv) loggedOutDiv.classList.add('hidden');
        if (loggedInDiv) loggedInDiv.classList.remove('hidden');
        if (nameDisplay) nameDisplay.innerText = user.displayName || "Leitor";
    } else {
        if (loggedOutDiv) loggedOutDiv.classList.remove('hidden');
        if (loggedInDiv) loggedInDiv.classList.add('hidden');
    }
});

// Inicialização
carregarNoticias();