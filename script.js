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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const postsContainer = document.getElementById('posts-container');

async function loadPosts() {
    try {
        const q = query(collection(db, "posts"), orderBy("data", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (postsContainer) {
            postsContainer.innerHTML = '';
        }

        if (querySnapshot.empty) {
            postsContainer.innerHTML = '<p class="loading">Nenhum post disponível no momento.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const post = doc.data();
            const postId = doc.id;
            const postElement = createPostElement(post, postId);
            postsContainer.appendChild(postElement);
        });

    } catch (error) {
        console.error("Erro ao carregar posts:", error);
        postsContainer.innerHTML = '<p class="loading">Erro ao carregar o conteúdo.</p>';
    }
}

function createPostElement(post, id) {
    const article = document.createElement('article');
    article.className = 'post-item';

    // Evento de clique para abrir a página de detalhes
    article.onclick = () => {
        window.location.href = `post.html?id=${id}`;
    };

    // Formatação de data (Ex: 30 DEZ)
    let dateStr = '---';
    if (post.data && post.data.toDate) {
        const date = post.data.toDate();
        dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
    }

    article.innerHTML = `
        <span class="post-date">${dateStr}</span>
        <div class="post-content-wrapper">
            <h3 class="post-title">${post.titulo}</h3>
            <p class="post-excerpt">${post.resumo}</p>
        </div>
    `;

    return article;
}

window.addEventListener('DOMContentLoaded', loadPosts);