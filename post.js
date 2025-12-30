import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURAÇÃO ---
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

// Função para formatar data
const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date);
};

async function loadSinglePost() {
    // 1. Pega o ID da URL (ex: post.html?id=ABC12345)
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        window.location.href = 'index.html'; // Se não tiver ID, volta pra home
        return;
    }

    try {
        // 2. Busca o documento específico pelo ID
        const docRef = doc(db, "noticias", postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // 3. Preenche o HTML
            document.title = `${data.titulo} | Mateus Calixto`;
            document.getElementById('post-title').innerText = data.titulo;
            document.getElementById('post-date').innerText = formatDate(data.data);
            
            // Tratamento da imagem
            const imgEl = document.getElementById('post-image');
            if (data.imagem) {
                imgEl.src = data.imagem;
                imgEl.style.display = 'block';
            }

            // Tratamento do corpo do texto
            // Nota: Se você salvou texto puro no banco, use innerText. 
            // Se salvou HTML (de um editor rico), use innerHTML.
            // Para este exemplo, vou assumir texto puro e converter quebras de linha em <br> ou <p>
            const bodyContainer = document.getElementById('post-body');
            
            // Simples conversor de texto para parágrafos
            if (data.conteudo) {
                 // Divide por quebra de linha e cria parágrafos
                 const paragraphs = data.conteudo.split('\n').filter(p => p.trim() !== '');
                 bodyContainer.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
            } else {
                // Fallback se usar apenas o campo 'resumo' para teste
                bodyContainer.innerHTML = `<p>${data.resumo}</p>`; 
            }

        } else {
            document.getElementById('article-content').innerHTML = "<h2>Notícia não encontrada.</h2>";
        }

    } catch (error) {
        console.error("Erro ao carregar post:", error);
    }
}

document.addEventListener('DOMContentLoaded', loadSinglePost);