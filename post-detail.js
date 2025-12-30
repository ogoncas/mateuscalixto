import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Configuração idêntica ao seu script.js
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

async function loadPostDetail() {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    const container = document.getElementById('post-content');

    // Se não houver ID na URL, volta para a home
    if (!postId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // Busca o documento específico no Firestore
        const docRef = doc(db, "posts", postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const post = docSnap.data();
            
            // Atualiza o título da aba do navegador
            document.title = `${post.titulo} | Mateus Calixto`;

            // Formatação da data
            let dateString = '';
            if (post.data && post.data.toDate) {
                dateString = post.data.toDate().toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                });
            } else {
                dateString = post.data || 'Data indisponível';
            }

            // Renderiza o conteúdo
            // Nota: post.conteudo pode conter tags HTML se você as salvar no Firestore
            container.innerHTML = `
                <span class="post-date">${dateString}</span>
                <h1 style="margin: 1rem 0 2rem 0; font-size: 2.5rem;">${post.titulo}</h1>
                <div class="post-body" style="font-size: 1.1rem; line-height: 1.8;">
                    ${post.conteudo}
                </div>
            `;
        } else {
            container.innerHTML = '<h2>Post não encontrado.</h2><p><a href="index.html">Voltar para o início</a></p>';
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
        container.innerHTML = '<p>Erro ao carregar o conteúdo. Verifique sua conexão.</p>';
    }
}

// Executa a função assim que o DOM carregar
window.addEventListener('DOMContentLoaded', loadPostDetail);