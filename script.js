// Importa as funções necessárias do SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDjuRApif2O4TgX2mAycKEcXULCnFSapbQ",
  authDomain: "mateuscalixto-b8d30.firebaseapp.com",
  projectId: "mateuscalixto-b8d30",
  storageBucket: "mateuscalixto-b8d30.firebasestorage.app",
  messagingSenderId: "1028342828902",
  appId: "1:1028342828902:web:6d283c8280e7c8aa5542a7"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para formatar data
const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date);
};

// Função Principal para Carregar Notícias
async function loadNews() {
    const grid = document.getElementById('news-grid');
    const heroTitle = document.getElementById('hero-title');
    const heroSummary = document.getElementById('hero-summary');

    try {
        // Busca a coleção 'noticias' ordenada por data (decrescente)
        const q = query(collection(db, "noticias"), orderBy("data", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            heroTitle.innerText = "Nenhuma notícia encontrada.";
            return;
        }

        let isFirst = true;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const postId = doc.id; // Pegamos o ID único do documento
            const postLink = `post.html?id=${postId}`; // Criamos o link
            
            // 1. LÓGICA PARA O DESTAQUE (HERO)
            if (isFirst) {
                const heroTitle = document.getElementById('hero-title');
                const heroSummary = document.getElementById('hero-summary');
                
                // Transformamos o título em um link clicável
                heroTitle.innerHTML = `<a href="${postLink}" style="text-decoration:none; color:inherit;">${data.titulo}</a>`;
                heroSummary.innerText = data.resumo;
                
                // Opcional: Adicionar um botão "Ler Mais" no Hero
                const heroContent = document.querySelector('.hero-content');
                const readMoreBtn = document.createElement('a');
                readMoreBtn.href = postLink;
                readMoreBtn.className = 'category-tag'; // Reutilizando a classe de estilo
                readMoreBtn.innerText = 'Ler notícia completa';
                readMoreBtn.style.marginTop = '20px';
                readMoreBtn.style.display = 'inline-block';
                readMoreBtn.style.textDecoration = 'none';
                heroContent.appendChild(readMoreBtn);

                isFirst = false;
            } 
            // 2. LÓGICA PARA O GRID (DEMAIS NOTÍCIAS)
            else {
                const card = document.createElement('article');
                card.className = 'news-card';
                const imageUrl = data.imagem || 'https://via.placeholder.com/400x250';

                card.innerHTML = `
                    <a href="${postLink}" style="text-decoration: none; color: inherit;">
                        <img src="${imageUrl}" alt="${data.titulo}" class="card-image" loading="lazy">
                        <span class="news-date">${formatDate(data.data)}</span>
                        <h4>${data.titulo}</h4>
                        <p class="news-excerpt">${data.resumo}</p>
                    </a>
                `;
                grid.appendChild(card);
            }
        });

    } catch (error) {
        console.error("Erro ao carregar notícias: ", error);
        heroTitle.innerText = "Erro ao conectar com o banco de dados.";
    }
}

// Executa ao carregar a página
document.addEventListener('DOMContentLoaded', loadNews);