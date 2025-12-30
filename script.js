// Importa as funções necessárias do SDK do Firebase (Versão 9 Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDjuRApif2O4TgX2mAycKEcXULCnFSapbQ",
    authDomain: "mateuscalixto-b8d30.firebaseapp.com",
    projectId: "mateuscalixto-b8d30",
    storageBucket: "mateuscalixto-b8d30.firebasestorage.app",
    messagingSenderId: "1028342828902",
    appId: "1:1028342828902:web:6d283c8280e7c8aa5542a7"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referência ao elemento HTML onde os posts serão mostrados
const postsContainer = document.getElementById('posts-container');

// Função para buscar e renderizar posts
async function loadPosts() {
    try {
        // Cria uma query para buscar a coleção 'posts', ordenados por data
        // Nota: Você precisa criar o índice no Firestore se der erro de 'requires an index'
        const q = query(collection(db, "posts"), orderBy("data", "desc"));
        
        const querySnapshot = await getDocs(q);
        
        // Limpa o texto de "Carregando..."
        postsContainer.innerHTML = '';

        if (querySnapshot.empty) {
            postsContainer.innerHTML = '<p>Nenhum post encontrado no momento.</p>';
            return;
        }

        // Itera sobre cada documento encontrado
        querySnapshot.forEach((doc) => {
            const post = doc.data();
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });

    } catch (error) {
        console.error("Erro ao carregar posts:", error);
        postsContainer.innerHTML = '<p>Erro ao carregar o conteúdo. Tente novamente mais tarde.</p>';
    }
}

// Função auxiliar para criar o HTML de cada post
function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post-item';

    // Formatação simples da data (assumindo que no firebase salvou como Timestamp ou String ISO)
    let dateString = '';
    if (post.data && post.data.toDate) {
        dateString = post.data.toDate().toLocaleDateString('pt-BR');
    } else {
        dateString = post.data || 'Data desconhecida';
    }

    article.innerHTML = `
        <span class="post-date">${dateString}</span>
        <h3 class="post-title">${post.titulo}</h3>
        <p class="post-excerpt">${post.resumo}</p>
        `;

    return article;
}

// Inicia o carregamento quando a página carrega
window.addEventListener('DOMContentLoaded', loadPosts);